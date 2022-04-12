let chats = [];

// Function getNewChatId
function getNewChatId(type) {
  let maxChat = 0
  for (let i = 0; i < chats.length; i++) {
    let chat = chats[i]
    if(type === 'Indi' && chat.name === "Indi") {
      let id = parseInt(chat.id.substring(1));
      if (id > maxChat) {
        maxChat = id
      }
    } else if (type === 'Group' && chat.name !== 'Indi') {    //TODO:check condition will not break
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

// Function addMsg
function addMsg(obj) {
  let chatId = obj.chatId;
  let msg = obj.msg;
  for(let i=0; i<chats.length; i++) {
    let chat = chats[i];
    if (chat.id === chatId) {
      chat.messages.push(msg);
      chat.seen = []
      return chat;
    }
  }
}

// Function getChat
function getChat(chatId) {
  for (i=0; i<chats.length; i++) {
    let chat = chats[i];
    //console.log('---------------------116 check')
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

function getChats() {
  return chats;
}

function setChats(newChats) {
  chats = newChats;
}

function setSeen(obj) {
  for (let chat of chats) {
    if(chat.id === obj.chatId) {
      chat.seen.push(obj.userId)
    }
  }
}

// export 
module.exports = {
  getNewChatId,
  addChat,
  addMsg, 
  getChat,
  getChatsContent,
  getChats,
  setSeen,
  setChats,
}