const path = require('path');
const http = require('http');
const express = require('express');   // npm run dev
const socketio = require('socket.io');
const { addUser, addChatToUser, getUsers, getUserIds, 
  getUserChatIds, getUserInfo, getUsersAndStatus, setStatus, 
  setUsername, setPassword} = require('./utils/users.js');
const { getNewChatId, addChat, getChat, addMsg,
  getChatsContent, getChats, setSeen } = require('./utils/chats.js');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// cosnt
let usersAndSockets = []

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

  // Receive 'setStatus'
  socket.on('setStatus', function(obj) {
    let userId1 = obj.id;
    let status1 = obj.status;
    usersAndSockets.push({userId:userId1, socketId:socket.id})
    setStatus({userId:userId1, status:status1});
    io.emit('statusChange', {userId:userId1, status:status1});
  })

  // Receive 'newSignUp'
  socket.on('newSignUp', function(user) {
    addUser(user);
    io.emit('newSignUp', user);
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
      seen : [newChatInfo.fromUser],
      showNotification : true,
      messages : []
    };
    addChat(newChat);

    // update users
    addChatToUser(newChatInfo.fromUser, newIndiChatId);
    addChatToUser(newChatInfo.toUser, newIndiChatId);

    // notify new user
    let info = {    //TODO: change fromUser to fromUserId
      fromUser : newChatInfo.fromUser,
      toUser : newChatInfo.toUser,
      newChat : newChat,
    }
    io.emit('newIndiChat', info);

    // Send updated chats list TODO: fix
    /*let userChatIds = getUserChatIds(newChatInfo.fromUser);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChats', userChatsContent);*/
  }) 

  // Receive 'newGroup'
  socket.on('newGroup', function(obj) {
    //console.log('--------------86')
    //console.log(obj)
    // create new id
    let newGroupChatId = getNewChatId('Group');

    // update chats
    let newChat = {
      id : newGroupChatId,
      name : obj.name,
      members : obj.selected,
      seen : [obj.selected[obj.selected.length -1]],
      showNotification : true,
      messages : []
    };
    addChat(newChat);

    // update users
    for (let userId of obj.selected) {
      addChatToUser(userId, newGroupChatId);
    }

    // notify new users
    let info = {
      selected : obj.selected,
      newChat : newChat,
    }
    io.emit('newGroupChat', info);
  })

  // Receive 'loadChat' //TODO: check this
  socket.on('loadChat', function({userId, chatId}) {
    let chat = getChat(chatId);
    socket.emit('chatObject', chat);
  })

  // Receive 'getChats'
  socket.on('getChats', function(obj) {
    let userId = obj.userId
    let userChatIds = getUserChatIds(userId);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChats', userChatsContent);
  })

  // Receive 'sendMessage'
  socket.on('sendMessage', function (obj) {
    let updatedChat = addMsg(obj);            // add message to chat
    io.emit('newMessage', updatedChat);       // emit chat //TODO: fix
  })

  // Receive 'changeName'
  socket.on('changeUsername', function(obj) {
    let userId = obj.userId;
    let newUsername = obj.newUsername;
    let user = setUsername({userId: userId, newUsername:newUsername})
    socket.emit('getUserInfo', user);
  })

  // Receive 'changePassword'
  socket.on('changePassword', function(obj) {
    let userId = obj.userId;
    let newPassword = obj.newPassword;
    let user = setPassword({userId: userId, newPassword:newPassword})
    socket.emit('getUserInfo', user);
  })

  // Chat was seen
  socket.on('seen', function(obj) {
    setSeen(obj);
  })

  // disconnet
  socket.on('disconnect', function() {
    for(let i=0; i<usersAndSockets.length; i++) {
      let item = usersAndSockets[i]
      if (item.socketId === socket.id) {
        setStatus({userId:item.userId, status:'ofline'})
        io.emit('statusChange', {userId:item.userId, status:'ofline'});
        usersAndSockets.splice(i, 1);
        break;
      }
    }
  })

})

// Server
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
