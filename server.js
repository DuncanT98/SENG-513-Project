const path = require('path');
const http = require('http');
const express = require('express');   // npm run dev
const socketio = require('socket.io');
const { addUser, addChatToUser, getUsers, getUserIds, 
  getUserIndexByEmail, getUserChatIds, getUserInfo } = require('./utils/users.js');
const { getNewChatId, addChat, getChat, addMsg,
  getChatsContent, getChats } = require('./utils/chats.js');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
  
  // Emit 'usersObject', send users
  const users = getUsers();
  socket.emit('usersObject', users)
  
  // Emit 'userIdsObject', send user Ids
  const userIds = getUserIds();
  socket.emit('userIdsObject', userIds)

  // Receive 'newSignUp'
  socket.on('newSignUp', function(user) {
    addUser(user);
  }) 

  // Receive 'getUserInfo'
  socket.on('getUserInfo', function(userId) {
    socket.emit('getUserInfo', getUserInfo(userId));
  })

  // Receive 'newIndiChat'
  socket.on('newIndiChat', function(newChatInfo) {
    // create chat id
    let newIndiChatId = getNewChatId('Indi');
    
    // update chats
    let newChat = {
      id : newIndiChatId,
      name : "Indi",
      members : [newChatInfo.fromUser, newChatInfo.toUser],
      messages : []
    };
    addChat(newChat);

    // update users
    addChatToUser(newChatInfo.fromUser, newIndiChatId);
    addChatToUser(newChatInfo.toUser, newIndiChatId);

    // Send updated chats list
    let userChatIds = getUserChatIds(newChatInfo.fromUser);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChats', userChatsContent);
  }) 

  // Receive 'loadChat'
  socket.on('loadChat', function({userId, chatId}) {
    let chat = getChat(chatId);
    socket.emit('chatObject', chat);
  })

  // Receive 'getChat'
  socket.on('getChat', function({userId, chatId}) {
    let userChatIds = getUserChatIds(userId);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChat', userChatsContent);
  })

  // Receive 'getChats'
  socket.on('getChats', function(userId) {
    let userChatIds = getUserChatIds(userId);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChats', userChatsContent);
  })

  // Receive 'sendMessage'
  socket.on('sendMessage', function (obj) {
    addMsg(obj);                            // update chats
    let chatId = obj.currentChat;           
    let chatContent = getChat(chatId);      // get updated chat
    let chats = getChats();
    io.emit('newMessage', chatContent);     // emit updated chat 
    io.emit('chats', chats);
  })

})

// Server
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
