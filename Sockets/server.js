const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');

  io.emit('chat message', 'Usuario conectado');

  socket.on('username', (username) => {
    users[socket.id] = username;
    io.emit('user connected', Object.values(users));
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
    const username = users[socket.id];
    delete users[socket.id];
    io.emit('chat message', `${username} se ha desconectado`);
    io.emit('user connected', Object.values(users));
  });

  socket.on('typing', () => {
    const username = users[socket.id];
    io.emit('typing', `${username} está escribiendo...`);
  });

  socket.on('chat message', (msg) => {
    const username = users[socket.id];
    io.emit('chat message', `${username}: ${msg}`);
  });

    socket.on('private message', ({ recipientId, message }) => {
    const sender = users[socket.id];
    const recipientSocket = io.sockets.sockets[recipientId];
    if (recipientSocket) {
      recipientSocket.emit('private message', { sender, message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
