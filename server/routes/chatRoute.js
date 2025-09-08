import express from "express";
import { createChat, deleteChat, getChats } from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";

const chatRouter = express.Router();

// Create new chat → POST
chatRouter.get('/create', protect, createChat);

// Get all chats → GET
chatRouter.get('/get', protect, getChats);

// Delete a chat → DELETE
chatRouter.delete('/:chatId', protect, deleteChat);

export default chatRouter;
