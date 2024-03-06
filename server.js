const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 5000;

let activePeers = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    activePeers[userId] = socket.id;
    console.log(`User ${userId} joined.`);
  });

  socket.on('call', ({ callerId, calleeId }) => {
    const calleeSocketId = activePeers[calleeId];
    if (calleeSocketId) {
      io.to(calleeSocketId).emit('incomingCall', { callerId, message: 'testing message' });
    } else {
      console.log(`User ${calleeId} is not connected.`);
    }
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(activePeers).find(key => activePeers[key] === socket.id);
    if (userId) {
      delete activePeers[userId];
      console.log(`User ${userId} disconnected.`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
