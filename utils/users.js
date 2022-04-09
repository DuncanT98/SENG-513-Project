// Createe users
const users = [];

let  user1 = {
  id : "u1",
  firstName : "First1",
  lastName : "Last1",
  email : "user1@mail.com",
  password : "123",
  chats : ["c1", "c2"],
  favs : []
}

let user2 = {
  id : "u2",
  firstName : "First2",
  lastName : "Last2",
  email : "user2@mail.com",
  password : "123",
  chats : ["c1", "c2"],
  favs : []
}

let user3 = {
  id : "u3",
  firstName : "First3",
  lastName : "Last3",
  email : "user3@mail.com",
  password : "123",
  chats : ["c2"],
  favs : []
}

users.push(user1);
users.push(user2);
users.push(user3);

// Function addUser
function addUser(user) {
  users.push(user);
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

// getUserIndex
function getUserIndexByEmail(email) {
  return(users.findIndex(user => user.email === email))
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

// export 
module.exports = {
  addUser,
  getUsers,
  getUserIds,
  getUserIndexByEmail,
  getUserChatIds
}