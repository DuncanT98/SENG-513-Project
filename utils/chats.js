const chats = [];

// Set chats 
let chat1 = {
  id : "i1",
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

let chat2 = {
  id : "i2",
  name : "Indi",
  members : ["u1", "u3"],
  messages : [
    {
      senderId : "u1",
      content : "hey"
    },
    {
      senderId: "u3",
      content : "hello"
    },
    {
      senderId: "u1",
      content : "how are you?"
    },
    {
      senderId: "u3",
      content : "good." 
    }
  ]
};

let group1 = {
  id : "g1",
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
chats.push(chat2)
chats.push(group1);

// Function getNewChatId
function getNewChatId(type) {
  let maxChat = 0
  for (i = 0; i < chats.length; i++) {
    let chat = chats[i]
    if(type === 'Indi' && chat.name === "Indi") {
      let id = parseInt(chat.id.substring(1));
      if (id > maxChat) {
        maxChat = id
      }
    } else if (type === 'Group' && chat.name === 'Group') {
      let id = parseInt(chat.id.substring(1));
      if (id > maxChat) {
        maxChat = id
      }
    }
  }

  if (type === 'Indi') {
    return "i" + (maxChat+1)
  } else if (type === 'Group') {
    return "g" + (maxChat+1)
  } else {
    return "ERROR"
  }
}

// Function addChat 
function addChat(newChat) {
  chats.push(newChat);
}

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
  getNewChatId,
  addChat,
  getChat,
  getChatsContent
}