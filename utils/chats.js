const chats = [];

// Set chat 
let chat1 = {
  id : "c1",
  name : "Indi",
  members : ["u1", "u2"],
  messages : [
    {
      senderId : "u1",
      content : "hey"
    },
    {
      senderId: "u2",
      content : "hello"
    },
    {
      senderId: "u1",
      content : "how are you?"
    },
    {
      senderId: "u2",
      content : "good." 
    }
  ]
};

let group1 = {
  id : "c2",
  name : "Group 1",
  members : ["u1", "u2", "u3"],
  messages : [
    {
      senderId : "u1",
      content : "Hello everyone!"
    }
  ]
}

chats.push(chat1);
chats.push(group1);

// Function getChat
function getChat(chatId) {
  for (index = 0; index < chats.length; index++) {
    let chat = chats[index];
    if (chat.id === chatId) {
      return chat;
    }
  }
}

// Function getChats
function getChatsContent(chatIds) {
  let userChats = []
  for (index = 0; index < chats.length; index++) {
    let chat = chats[index];
    for (index1 = 0; index1 < chatIds.length; index1++) {
      let chatId = chatIds[index1];
      if (chat.id === chatId) {
        userChats.push(chat);
      }
    }
  }
  return userChats;
}

// export 
module.exports = {
  getChat,
  getChatsContent
}