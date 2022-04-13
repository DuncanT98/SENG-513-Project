//MongoDB needed for GridFS, check with Duncan
const stream = require("stream");

const mongodb = require("mongodb");
var fs = require('fs');

let credentials = fs.readFileSync("./credentials.txt", "utf-8");
credentials = credentials.split("\n")
let databaseUsername = credentials[0];
let databasePassword = credentials[1];
let databaseHostname = credentials[2];
let databaseOptions = credentials[3];
const uri = `mongodb+srv://${databaseUsername}:${databasePassword}@${databaseHostname}${databaseOptions}`;
console.log(uri);
// Create a new MongoClient
const client = new mongodb.MongoClient(uri);
const PORT = 3000 || process.env.PORT;
client.connect().then((result) => server.listen(PORT, () => console.log(`Server running on port ${PORT}...`))).catch((err) => console.log(err))

// /****************************************************** */


const path = require('path');
const http = require('http');
const express = require('express');   // npm run dev
const socketio = require('socket.io');
const { addUser, addChatToUser, getUsers, getUserIds, removeGroupFromUser,
  getUserChatIds, getUserInfo, getUsersAndStatus, setStatus,
  setUsername, setPassword, setUsers } = require('./utils/users.js');
const { getNewChatId, addChat, getChat, addMsg,
  getChatsContent, getChats, setSeen, setChats, addToMute,  leaveGroup } = require('./utils/chats.js');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// cosnt
let usersAndSockets = []

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
let serverStarted = false;
// Run when client connects
io.on('connection', socket => {

  const db = client.db("ChatApp");
  const bucket = new mongodb.GridFSBucket(db);

  async function saveChatsToDatabase() {
    // if chats are not in database, initialize empty list
    const query = { _id: "chatInfo" };
    let searchResult = await db.collection("chats").findOne(query);
    if (searchResult == null) {
      const doc = { _id: "chatInfo", chats: getChats() };
      let x = await db.collection("chats").insertOne(doc);
      console.log(x.insertedId);
    }
    console.log("HERE");
    console.log(getChats());
    const filter = { _id: "chatInfo" }
    const replace = { chats: getChats() };
    const result = await db.collection("chats").replaceOne(filter, replace);
    console.log(
      `The chats were inserted with the _id: ${result}`,
    );
  }

  async function saveUsersToDatabase() {
    // if users are not in database, initialize empty list
    const query = { _id: "userInfo" };
    let searchResult = await db.collection("users").findOne(query);
    if (searchResult == null) {
      const doc = { _id: "userInfo", users: getUsers() };
      await db.collection("users").insertOne(doc);
    }
    const filter = { _id: "userInfo" }
    const replace = { users: getUsers() };
    const result = await db.collection("users").replaceOne(filter, replace);
    console.log(
      `The users were inserted with the _id: ${result}`,
    );
  }

  async function getChatsFromDatabase() {
    const query = { _id: "chatInfo" };
    const result = await db.collection("chats").findOne(query);
    let newChats;
    if (result == null) {
      newChats = [];
    } else {
      newChats = result["chats"];
    }
    console.log(newChats);
    setChats(newChats);
  }

  async function getUsersFromDatabase() {
    const query = { _id: "userInfo" };
    const result = await db.collection("users").findOne(query);
    console.log(result);
    let newUsers;
    if (result == null) {
      newUsers = [];
    } else {
      newUsers = result["users"];
    }
    setUsers(newUsers);
  }

  if (!serverStarted) {
    serverStarted = true;
    getChatsFromDatabase();
    getUsersFromDatabase();
  }
  saveUsersToDatabase();
  saveChatsToDatabase();

  // Emit 'usersObject', send users
  const users = getUsers();
  socket.emit('usersObject', users)

  // Emit 'userIdsObject', send user Ids
  const userIds = getUserIds();
  socket.emit('userIdsObject', userIds)

  // Receive 'setStatus'
  socket.on('setStatus', function (obj) {
    let userId1 = obj.id;
    let status1 = obj.status;
    usersAndSockets.push({ userId: userId1, socketId: socket.id })
    setStatus({ userId: userId1, status: status1 });
    io.emit('statusChange', { userId: userId1, status: status1 });
  })

  // Receive 'newSignUp'
  socket.on('newSignUp', function (user) {
    addUser(user);
    io.emit('newSignUp', user);
  })

  // Receive 'getUserInfo'
  socket.on('getUserInfo', function (userId) {
    saveUsersToDatabase()
    saveChatsToDatabase()
    socket.emit('getUserInfo', getUserInfo(userId));
  })

  // Receive 'newIndiChat'
  socket.on('newIndiChat', function (newChatInfo) {
    // create chat id
    let newIndiChatId = getNewChatId('Indi');

    // update chats
    let newChat = {
      id: newIndiChatId,
      name: "Indi",
      members: [newChatInfo.fromUser, newChatInfo.toUser],
      seen: [newChatInfo.fromUser],
      showNotification: true,
      messages: [],
      mute : []
    };
    addChat(newChat);
    saveChatsToDatabase();

    // update users
    addChatToUser(newChatInfo.fromUser, newIndiChatId);
    addChatToUser(newChatInfo.toUser, newIndiChatId);

    // notify new user
    let info = {    //TODO: change fromUser to fromUserId
      fromUser: newChatInfo.fromUser,
      toUser: newChatInfo.toUser,
      newChat: newChat,
    }
    io.emit('newIndiChat', info);

    // Send updated chats list TODO: fix
    /*let userChatIds = getUserChatIds(newChatInfo.fromUser);
    let userChatsContent = getChatsContent(userChatIds);
    socket.emit('getChats', userChatsContent);*/
  })

  // Receive 'newGroup'
  socket.on('newGroup', function (obj) {
    //console.log('--------------86')
    //console.log(obj)
    // create new id
    let newGroupChatId = getNewChatId('Group');

    // update chats
    let newChat = {
      id: newGroupChatId,
      name: obj.name,
      members: obj.selected,
      seen: [obj.selected[obj.selected.length - 1]],
      showNotification: true,
      messages: [],
      mute : []
    };
    addChat(newChat);
    saveChatsToDatabase();

    // update users
    for (let userId of obj.selected) {
      addChatToUser(userId, newGroupChatId);
    }

    // notify new users
    let info = {
      selected: obj.selected,
      newChat: newChat,
    }
    io.emit('newGroupChat', info);
  })

  // Receive 'loadChat' //TODO: check this
  socket.on('loadChat', function ({ userId, chatId }) {
    let chat = getChat(chatId);
    socket.emit('chatObject', chat);
  })

  // Receive 'getChats'
  socket.on('getChats', function (obj) {
    let userId = obj.userId
    let userChatIds = getUserChatIds(userId);
    let userChatsContent = []
    if (userChatIds !== undefined) {
      userChatsContent = getChatsContent(userChatIds);
    }
    socket.emit('getChats', userChatsContent);
  })

  // Receive 'sendMessage'
  socket.on('sendMessage', function (obj) {
    let updatedChat = addMsg(obj);            // add message to chat
    io.emit('newMessage', updatedChat);       // emit chat //TODO: fix
  })

  // Receive 'changeName'
  socket.on('changeUsername', function (obj) {
    let userId = obj.userId;
    let newUsername = obj.newUsername;
    let user = setUsername({ userId: userId, newUsername: newUsername })
    socket.emit('getUserInfo', user);
    saveUsersToDatabase();
    saveChatsToDatabase()
  })

  // Receive 'changePassword'
  socket.on('changePassword', function (obj) {
    let userId = obj.userId;
    let newPassword = obj.newPassword;
    let user = setPassword({ userId: userId, newPassword: newPassword })
    socket.emit('getUserInfo', user);
    saveUsersToDatabase();
  })

  // Chat was seen
  socket.on('seen', function (obj) {
    setSeen(obj);
    saveChatsToDatabase();
  })

  // Chat 
  socket.on('addToMute', function (obj) {
    addToMute(obj);
    saveChatsToDatabase();
  })

  socket.on('leaveGroup', function (obj) {
    leaveGroup(obj);
    removeGroupFromUser(obj)
    saveChatsToDatabase();
    saveUsersToDatabase();
    let userId = obj.userId
    let userChatIds = getUserChatIds(userId);
    let userChatsContent = []
    if (userChatIds !== undefined) {
      userChatsContent = getChatsContent(userChatIds);
    }
    socket.emit('getChats', userChatsContent);

  })

  // disconnet
  socket.on('disconnect', function () {
    for (let i = 0; i < usersAndSockets.length; i++) {
      let item = usersAndSockets[i]
      if (item.socketId === socket.id) {
        setStatus({ userId: item.userId, status: 'ofline' })
        io.emit('statusChange', { userId: item.userId, status: 'ofline' });
        usersAndSockets.splice(i, 1);
        break;
      }
    }
  })

  // Receive 'sendMessage'
  socket.on('sendFile', function (obj) {
    let contentOfObj = obj.msg;
    const readable = new stream.Readable()
    readable._read = () => { } // _read is required but you can noop it
    readable.push(contentOfObj.fileContent)
    readable.push(null)
    let insertedId = readable.pipe(bucket.openUploadStream(contentOfObj.fileName)).id;
    obj.msg = {
      senderId: obj.msg.senderId,
      content: `file(${insertedId})${contentOfObj.fileName}`
    }
    // addMsg(obj);    
    // let chatId = obj.currentChat;           
    // let chatContent = getChat(chatId);      // get updated chat
    // let chats = getChats();
    // io.emit('newMessage', chatContent);     // emit updated chat 
    // io.emit('chats', chats);
    let updatedChat = addMsg(obj);            // add message to chat
    io.emit('newMessage', updatedChat);
  })

  socket.on("getFile", function (fileName, fileId) {
    let filestream = bucket.openDownloadStream(mongodb.ObjectId(fileId)).pipe(fs.createWriteStream('./outputFile'));
    filestream.on('finish', async () => {
      let fileContents = fs.readFileSync('./outputFile');
      socket.emit('sendFile', fileName, fileContents);
      fs.unlinkSync('./outputFile');
    });

  });

})

// Server
// server.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
