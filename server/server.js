import express from 'express';
import "dotenv/config"; // Load environment variables
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/user.routes.js';
import chatRouter from './routes/chatRoute.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Server is Live!!'));
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/messages', messageRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});