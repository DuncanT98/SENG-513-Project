const path = require('path');
const http = require('http');
const express = require('express');   // npm run dev
const socketio = require('socket.io');
const { addUser, getUsers, getUserIds, 
  getUserIndexByEmail, getUserChatIds } = require('./utils/users.js');
const { getChat, getChatsContent } = require('./utils/chats.js');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  
  // Send users
  const users = getUsers();
  socket.emit('usersObject', users)
  
  // Send user Ids
  const userIds = getUserIds();
  socket.emit('userIdsObject', userIds)

  // newSignUp
  socket.on('newSignUp', function(user) {
    addUser(user);
  }) 

  // loadChat
  socket.on('loadChat', function({userId, chatId}) {
    let chat = getChat(chatId);
    socket.emit('chatObject', chat);
  })

  // getChats
  socket.on('getChats', function(userId) {
    let userChatIds = getUserChatIds(userId);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChats', userChatsContent);
  })

})

// Server
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
