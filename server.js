const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = {};
let SALAS = ['#General', '#Mexico', '#CDMX', '#Amistad', '#Videojuegos'];
const palabrasProhibidas = /(spam|http|www\.|groseria)/i;

io.on('connection', (socket) => {
  const guestNick = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
  const colors = ['#d9534f', '#0275d8', '#5cb85c', '#f0ad4e', '#8e44ad', '#e67e22'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  users[socket.id] = { id: socket.id, nick: guestNick, color: randomColor, rooms: ['#General'] };
  socket.join('#General');

  socket.emit('init_data', { user: users[socket.id], rooms: SALAS });
  io.emit('update_users', Object.values(users));
  io.to('#General').emit('system_msg', { target: '#General', text: `${guestNick} ha entrado a #General.` });

  socket.on('join_room', (rawRoomName) => {
    let roomName = rawRoomName.trim().replace(/\s+/g, '-').substring(0, 25);
    if (!roomName) return;
    if (!roomName.startsWith('#')) roomName = '#' + roomName;

    if (!SALAS.includes(roomName)) {
      SALAS.push(roomName);
      io.emit('update_rooms', SALAS);
    }

    if (!users[socket.id].rooms.includes(roomName)) {
      users[socket.id].rooms.push(roomName);
      socket.join(roomName);
      io.to(roomName).emit('system_msg', { target: roomName, text: `${users[socket.id].nick} se ha unido a ${roomName}.` });
    }
  });

  socket.on('leave_room', (roomName) => {
    if (roomName === '#General') return;
    users[socket.id].rooms = users[socket.id].rooms.filter(r => r !== roomName);
    socket.leave(roomName);
    io.to(roomName).emit('system_msg', { target: roomName, text: `${users[socket.id].nick} salió de ${roomName}.` });
  });

  socket.on('change_nick', (newNick) => {
    const cleanNick = newNick.trim().substring(0, 20);
    if (!cleanNick) return;
    const oldNick = users[socket.id].nick;
    users[socket.id].nick = cleanNick;
    io.emit('update_users', Object.values(users));
    users[socket.id].rooms.forEach(room => {
      io.to(room).emit('system_msg', { target: room, text: `${oldNick} ahora es conocido como ${cleanNick}` });
    });
  });

  socket.on('send_message', ({ target, text, isPrivate }) => {
    const sender = users[socket.id];
    if (!sender || !text.trim()) return;

    if (palabrasProhibidas.test(text)) {
      sender.rooms.forEach(room => {
        io.to(room).emit('system_msg', { target: room, text: `${sender.nick} ha sido expulsado por Bot.` });
      });
      socket.disconnect();
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgData = { senderId: socket.id, senderNick: sender.nick, senderColor: sender.color, text: text.trim(), time, isPrivate };

    if (isPrivate) {
      io.to(target).emit('receive_message', { ...msgData, chatId: socket.id, chatName: sender.nick });
      socket.emit('receive_message', { ...msgData, chatId: target });
    } else {
      io.to(target).emit('receive_message', { ...msgData, chatId: target });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      delete users[socket.id];
      io.emit('update_users', Object.values(users));
      user.rooms.forEach(room => {
        io.to(room).emit('system_msg', { target: room, text: `${user.nick} se ha desconectado.` });
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Chat corriendo en puerto ${PORT}`));

