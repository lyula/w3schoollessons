// Basic index.js for Express + Socket.io server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const authRoutes = require('./routes/authRoutes');
const jwtAuth = require('./middlewares/jwtAuth');
const jwt = require('jsonwebtoken');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes); // Public
// Protect all other API routes
app.use('/api', jwtAuth);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Socket.io Chat Server Running');
});

// --- SOCKET.IO LOGIC ---
const users = {};

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // --- USER ONLINE STATUS & GROUP JOIN NOTIFICATION ---
  socket.on('join', async ({ userId, username }) => {
    users[socket.id] = { userId, username };
    socket.join('global');
    // Notify all in group (except the joining user)
    socket.to('global').emit('group-notification', {
      type: 'join',
      userId,
      username,
      message: `${username} joined the group chat.`
    });
    io.to('global').emit('user-joined', { userId, username });
    // Set user online in DB
    try {
      const User = require('./models/User');
      await User.findByIdAndUpdate(userId, { online: true });
    } catch {}
  });

  // --- GROUP TYPING INDICATOR ---
  socket.on('typing-group', ({ username }) => {
    socket.to('global').emit('typing-group', { username });
  });
  socket.on('stop-typing-group', ({ username }) => {
    socket.to('global').emit('stop-typing-group', { username });
  });

  // --- PRIVATE TYPING INDICATOR ---
  socket.on('typing-private', ({ roomId, username }) => {
    socket.to(roomId).emit('typing-private', { username });
  });
  socket.on('stop-typing-private', ({ roomId, username }) => {
    socket.to(roomId).emit('stop-typing-private', { username });
  });

  // --- GROUP MESSAGE ---
  socket.on('send-group-message', (data) => {
    io.to('global').emit('receive-group-message', data);
  });

  // --- PRIVATE MESSAGE ---
  socket.on('send-private-message', async ({ roomId, message }) => {
    io.to(roomId).emit('receive-private-message', message);
    // Mark as unread/read logic can be handled here
  });

  // --- READ RECEIPT ---
  socket.on('read-message', async ({ messageId, userId }) => {
    const Message = require('./models/Message');
    await Message.findByIdAndUpdate(messageId, { read: true });
    io.emit('message-read', { messageId, userId });
  });

  // --- MESSAGE REACTIONS ---
  socket.on('react-message', async ({ messageId, userId, reaction }) => {
    const Message = require('./models/Message');
    await Message.findByIdAndUpdate(messageId, { $push: { reactions: { user: userId, reaction } } });
    io.emit('message-reacted', { messageId, userId, reaction });
  });

  // --- JOIN PRIVATE ROOM ---
  socket.on('join-private', (roomId) => {
    socket.join(roomId);
  });

  // --- LAST SEEN (PRIVATE ONLY) ---
  socket.on('update-last-seen', async ({ userId }) => {
    const User = require('./models/User');
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
  });

  socket.on('disconnect', async () => {
    const user = users[socket.id];
    if (user) {
      io.to('global').emit('user-left', user);
      // Set user offline and update last seen
      try {
        const User = require('./models/User');
        await User.findByIdAndUpdate(user.userId, { online: false, lastSeen: new Date() });
      } catch {}
      delete users[socket.id];
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
