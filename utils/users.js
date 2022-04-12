// Createe users
const users = [];

let  user1 = {
  id : 'u1',
  username : "user1",
  password : '123',
  chats : ['i1', 'g1'],
  favs : [],
  status : 'ofline'
}

let user2 = {
  id : 'u2',
  username : 'user2',
  password : '123',
  chats : ['i1', 'g1'],
  favs : [],
  status : 'ofline'
}

let user3 = {
  id : 'u3',
  username : 'user3',
  password : '123',
  chats : ['g1'],
  favs : [],
  status : 'ofline'
}

users.push(user1);
users.push(user2);
users.push(user3);

// Function addUser
function addUser(user) {
  users.push(user);
}

// Function addChatToUser
function addChatToUser(userId, chatId) {
  for (i = 0; i < users.length; i++) {
    user = users[i]
    if (user.id === userId) {
      user.chats.push(chatId)
    }
  }
}

// Function getUsers
function getUsers() {
  return users;
}

// Function getUserIds
function getUserIds() {
  const userIds = []
  for (index = 0; index < users.length; index++) {
    let user = users[index];
    userIds.push(user.id);
  }
  return userIds;
}

// Function getUserChats
function getUserChatIds(userId) {
  for (index = 0; index < users.length; index++) {
    let user = users[index];
    if (user.id === userId) {
      return user.chats;
    }
  }
}

// Function getUserInfo
function getUserInfo(userId) {
  for(let i=0; i<users.length; i++) {
    let user = users[i];
    if (user.id === userId) {
      return user;
    }
  }
}

// Function getUsersAndStatus
function getUsersAndStatus() {
  let array = []
  for(let i=0; i<users.length; i++) {
    let user = users[i];
    let item = {
      userId: user.id,
      status : user.status
    }
    array.push(item);
  }
  return array;
}

// Function 'setUsername'
function setUsername(obj) {
  let userId = obj.userId;
  let newUsername = obj.newUsername;
  for(let i=0; i<users.length; i++) {
    let user = users[i];
    if (user.id === userId) {
      user.username = newUsername;
      return user;
    }
  }
}

// Function 'setPassword'
function setPassword(obj) {
  let userId = obj.userId;
  let newPassword = obj.newPassword;
  for(let i=0; i<users.length; i++) {
    let user = users[i];
    if (user.id === userId) {
      user.password = newPassword;
      return user;
    }
  }
}

// Function 'setStatus'
function setStatus(obj) {
  let userId = obj.userId;
  let newStatus = obj.status;
  for(let i=0; i<users.length; i++) {
    let user = users[i];
    if (user.id === userId) {
      user.status = newStatus;
      break;
    }
  }
}

// export 
module.exports = {
  addUser,
  addChatToUser,
  getUsers,
  getUserIds,
  getUserChatIds,
  getUserInfo,
  getUsersAndStatus,
  setUsername,
  setPassword,
  setStatus
}