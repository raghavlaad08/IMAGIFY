import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import moment from "moment";
import toast from 'react-hot-toast';

const Sidebar = ({isMenuOpen,setIsMenuOpen}) => {
  // Use the logout function from context instead of creating your own
  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, logout} = useAppContext();
  const [search, setSearch] = useState('');

  // Renamed for clarity and removed the unnecessary 'e' parameter
  const handleDeleteChat = async (chatId) => {
    try{
      const confirm = window.confirm('Are you sure you want to delete this chat?');
      if(!confirm) return;

      const token = localStorage.getItem('token');
      const {data} = await axios.post('/api/chat/delete',{chatId},{headers:{
        Authorization : `Bearer ${token}`
      }});

      if(data.success){
        setChats(prev=>prev.filter(chat=> chat._id !==chatId));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }

    }catch(error){
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div
      className={`
        flex flex-col
        h-screen
        min-w-72
        p-5
        dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30
        border-r border-[#80609f]/30
        backdrop-blur-3xl
        transition-all duration-500
        max-md:absolute left-0 z-10
        ${!isMenuOpen && `max-md:-translate-x-full`}`}
    >
      {/* Logo */}
      <img
        src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
        alt=""
        className="w-full max-w-48"
      />

      {/* New Chat Button */}
      <button onClick={createNewChat} className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456f7] to-[#3D81F6] text-sm rounded-md cursor-pointer">
        <span className="mr-2 text-xl">+</span>New Chat
      </button>

      {/* Search Conversation */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img
          src={assets.search_icon}
          alt="Search Icon"
          className="w-4 invert dark:invert-0"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Conversation"
          className="text-xs placeholder:text-gray-400 outline-none w-full bg-transparent"
        />
      </div>

      {/* Recent Chats Label */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

      {/* Filtered Chat List */}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) => {
            const term = search.toLowerCase();
            if (chat.messages && chat.messages[0]) {
              return chat.messages[0].content.toLowerCase().includes(term);
            }
            return chat.name.toLowerCase().includes(term);
          })
          .map((chat) => (
            <div onClick={()=>{ navigate('/'); setSelectedChat(chat); setIsMenuOpen(false)}}
              key={chat._id}
              className="p-2 px-4 dark:bg-[#57317c]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group"
            >
              <div>
                <p className="truncate w-full">
                  {chat.messages && chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer invert"
                alt=""
                // Corrected onClick handler
                onClick={(e) => {
                  e.stopPropagation(); 
                  toast.promise(handleDeleteChat(chat._id), { loading: 'deleting...' });
                }}
              />
            </div>
          ))}
      </div>
      {/* Community Images Section */}
      <div onClick={()=>{navigate('/community'); setIsMenuOpen(false)}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all'>
        <img src={assets.gallery_icon} className='w-4 invert' alt="" />
        <div className='flex flex-col text-sm'>
          <p>Community Images</p>
        </div>
      </div>
      {/*Credit Purchase Option*/}
      <div onClick={()=>{navigate('/credits'); setIsMenuOpen(false)}} className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all'>
        <img src={assets.diamond_icon} className='w-4 dark:invert' alt="" />
        <div className='flex flex-col text-sm'>
          <p>Credits : {user?.credits}</p>
          <p className='text-xs text-gray-400' >Purchase credits to use quickgpt</p>
        </div>
      </div>
      {/* Dark mode Toggle */}
      <div className='flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md '>
        
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className='w-4 invert'  alt="" />
          <p>Dark Mode</p>
        </div>
        <label className='relative inline-flex cursor-pointer'>
          <input onChange={()=> setTheme (theme==='dark' ? 'light':'dark')} type="checkbox" className='sr-only peer' checked={theme=== 'dark'} />
          <div className='w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all'>

          </div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4'>
          </span>
        </label>
      </div>
      {/* User Account - Fixed to use context logout function */}
      <div onClick={()=>{user ? logout() : navigate('/login')}} className='flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group '>
        <img src={assets.gallery_icon} className='w-7 rounded-full' alt="User Account" />
        <p className='flex-1 text-sm dark:text-primary truncate'>{user ? user.name : 'Login Your Account'} </p>
        {user && <img src={assets.logout_icon} className='h-5 cursor-pointer hidden invert group-hover:block' alt="Logout"/> }
      </div>
      <img onClick={()=>setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden invert' alt="" />

    </div>
  );
};

export default Sidebar;