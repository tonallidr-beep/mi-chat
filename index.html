const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
// Permitir archivos hasta 15MB (fotos y videos cortos)
const io = new Server(server, { maxHttpBufferSize: 1.5e7 });

app.use(express.static(path.join(__dirname, 'public')));

const users = {};
let SALAS = ['#Solteros', '#Citas', '#CDMX', '#Ligue', '#Amistad'];
const palabrasProhibidas = /(spam|http|www\.|groseria)/i;
const ADMIN_PASS = 'tonalli2026'; // <-- TU CLAVE DE MODERADOR

io.on('connection', (socket) => {
  const guestNick = `User${Math.floor(1000 + Math.random() * 9000)}`;
  users[socket.id] = { id: socket.id, nick: guestNick, gender: '👤', age: '', isAdmin: false, rooms: ['#Solteros'] };
  socket.join('#Solteros');

  socket.emit('init_data', { user: users[socket.id], rooms: SALAS });
  io.emit('update_users', Object.values(users));
  io.to('#Solteros').emit('system_msg', { target: '#Solteros', text: `${guestNick} entró a #Solteros.` });

  // Configurar perfil (Apodo, Género, Edad)
  socket.on('update_profile', ({ nick, gender, age }) => {
    const u = users[socket.id];
    if (!u) return;
    const oldNick = u.nick;
    if (nick && nick.trim()) u.nick = nick.trim().substring(0, 18);
    if (gender) u.gender = gender;
    if (age) u.age = age.toString().substring(0, 2);

    io.emit('update_users', Object.values(users));
    if (oldNick !== u.nick) {
      u.rooms.forEach(r => io.to(r).emit('system_msg', { target: r, text: `${oldNick} ahora es ${u.nick}` }));
    }
  });

  // Activar modo Moderador
  socket.on('claim_admin', (pass) => {
    if (pass === ADMIN_PASS && users[socket.id]) {
      users[socket.id].isAdmin = true;
      socket.emit('admin_granted');
      io.emit('update_users', Object.values(users));
    }
  });

  // Expulsar usuario (Solo Moderador)
  socket.on('kick_user', (targetId) => {
    if (!users[socket.id]?.isAdmin || !users[targetId]) return;
    const kickedNick = users[targetId].nick;
    io.emit('system_msg', { target: '#Solteros', text: `🛡️ Moderador expulsó a ${kickedNick} del chat.` });
    io.to(targetId).emit('kicked');
    io.sockets.sockets.get(targetId)?.disconnect();
  });

  socket.on('join_room', (rawRoom) => {
    let room = rawRoom.trim().replace(/\s+/g, '-').substring(0, 22);
    if (!room) return;
    if (!room.startsWith('#')) room = '#' + room;
    if (!SALAS.includes(room)) { SALAS.push(room); io.emit('update_rooms', SALAS); }
    if (!users[socket.id].rooms.includes(room)) {
      users[socket.id].rooms.push(room);
      socket.join(room);
      io.to(room).emit('system_msg', { target: room, text: `${users[socket.id].nick} se unió a ${room}.` });
    }
  });

  socket.on('leave_room', (room) => {
    if (room === '#Solteros') return;
    users[socket.id].rooms = users[socket.id].rooms.filter(r => r !== room);
    socket.leave(room);
  });

  // Mensajes de texto y Multimedia (solo en privado)
  socket.on('send_message', ({ target, text, media, mediaType, isPrivate }) => {
    const sender = users[socket.id];
    if (!sender || (!text?.trim() && !media)) return;
    if (media && !isPrivate) return; // Bloquear fotos/videos en salas públicas

    if (!sender.isAdmin && text && palabrasProhibidas.test(text)) {
      io.to('#Solteros').emit('system_msg', { target: '#Solteros', text: `🤖 Bot expulsó a ${sender.nick}.` });
      socket.disconnect();
      return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgData = {
      senderId: socket.id,
      senderNick: `${sender.isAdmin ? '👑 ' : ''}${sender.gender} ${sender.nick}${sender.age ? ' ('+sender.age+')' : ''}`,
      isAdmin: sender.isAdmin,
      text: text ? text.trim() : '',
      media: isPrivate ? media : null,
      mediaType,
      time,
      isPrivate
    };

    if (isPrivate) {
      io.to(target).emit('receive_message', { ...msgData, chatId: socket.id, chatName: sender.nick });
      socket.emit('receive_message', { ...msgData, chatId: target });
    } else {
      io.to(target).emit('receive_message', { ...msgData, chatId: target });
    }
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      delete users[socket.id];
      io.emit('update_users', Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CitasYa corriendo en puerto ${PORT}`));
