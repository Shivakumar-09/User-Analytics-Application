import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict to frontend URL
    methods: ['GET', 'POST']
  }
});

// Attach io to app for controllers to use
app.set('io', io);

// Connect to DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Socket.io Real-Time Connection
let activeUsers = 0;
io.on('connection', (socket) => {
  activeUsers++;
  io.emit('active_users', activeUsers);
  
  socket.on('disconnect', () => {
    activeUsers--;
    io.emit('active_users', activeUsers);
  });
});

// API Routes
app.use('/api', apiRoutes);

// Serve SDK script statically for testing purposes
// In real world, it could be hosted on CDN
app.use('/sdk', express.static(path.join(__dirname, '../../sdk/dist')));

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
