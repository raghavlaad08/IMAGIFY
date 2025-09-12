import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

// Create axios instance outside the component to avoid recreation
const createApiInstance = () => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,
  });

  // Add request interceptor
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      console.log('Interceptor - Token from localStorage:', token);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Interceptor - Added Authorization header:', config.headers.Authorization);
      } else {
        console.log('Interceptor - No token found');
      }
      
      console.log('Interceptor - Final headers:', config.headers);
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('Response interceptor - Status:', error.response?.status);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        // You could also dispatch an event here to update the context
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Create single instance
const api = createApiInstance();

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);

  // Update token state when localStorage changes
  const updateToken = useCallback((newToken) => {
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken);
    } else {
      setToken(null);
      localStorage.removeItem("token");
    }
  }, []);

  // Login function
  const login = useCallback(async (newToken) => {
    try {
      // Set token first
      updateToken(newToken);
      
      setLoadingUser(true);
      
      // Test the API call
      const { data } = await api.get("/api/user/data");
      
      if (data.success) {
        setUser(data.user);
        toast.success("Login successful!");
        return { success: true };
      } else {
        updateToken(null);
        toast.error(data.message || "Login failed");
        return { success: false, message: data.message };
      }
    } catch (error) {
      updateToken(null);
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, message: error.message };
    } finally {
      setLoadingUser(false);
    }
  }, [updateToken]);

  // Logout function
  const logout = useCallback(() => {
    updateToken(null);
    setUser(null);
    setChats([]);
    setSelectedChat(null);
    toast.success("Logged out successfully");
    navigate("/login");
  }, [navigate, updateToken]);

  // Fetch user
  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    try {
      console.log('fetchUser - About to make request');
      const { data } = await api.get("/api/user/data");
      console.log('fetchUser - Response received:', data);

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
        toast.error(data.message || "Could not fetch user");
      }
    } catch (error) {
      console.log('fetchUser - Error:', error.response?.status);
      setUser(null);
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Error fetching user");
      }
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Fetch chats
  const fetchUsersChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      setSelectedChat(null);
      return;
    }

    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setChats([]);
      setSelectedChat(null);
      return;
    }

    setLoadingChats(true);
    try {
      console.log('fetchUsersChats - About to make request');
      const { data } = await api.get("/api/chat/get");
      console.log('fetchUsersChats - Response received:', data);
      
      if (data.success) {
        setChats(data.chats || []);
        if (data.chats.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0]);
        } else if (data.chats.length === 0) {
          setSelectedChat(null);
        }
      } else {
        toast.error(data.message || "Could not fetch chats");
      }
    } catch (error) {
      console.log('fetchUsersChats - Error:', error.response?.status);
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Error fetching chats");
      }
    } finally {
      setLoadingChats(false);
    }
  }, [user, selectedChat]);

  // Create new chat
  const createNewChat = useCallback(async () => {
    if (!user) {
      toast.error("Login to create a new chat");
      return;
    }

    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      toast.error("No authentication token found. Please login again.");
      return;
    }

    try {
      console.log('createNewChat - About to make request');
      console.log('createNewChat - Token in localStorage:', currentToken);
      
      const { data } = await api.post("/api/chat/create", {});
      console.log('createNewChat - Response received:', data);
      
      if (data.success) {
        setChats(prev => [data.chat, ...prev]);
        setSelectedChat(data.chat);
        navigate("/");
        toast.success("New chat created successfully");
      } else {
        toast.error(data.message || "Could not create chat");
      }
    } catch (error) {
      console.log('createNewChat - Error:', error.response?.status);
      console.log('createNewChat - Error details:', error);
      
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Error creating chat");
      }
    }
  }, [user, navigate]);

  // Initialize on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser();
    } else {
      setLoadingUser(false);
    }
  }, []);

  // Fetch chats when user changes
  useEffect(() => {
    fetchUsersChats();
  }, [user]);

  // Theme effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = {
    user,
    setUser,
    token,
    setToken,
    theme,
    setTheme,
    chats,
    selectedChat,
    setSelectedChat,
    createNewChat,
    fetchUser,
    fetchUsersChats,
    loadingUser,
    loadingChats,
    navigate,
    axios: api,
    login,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return ctx;
};