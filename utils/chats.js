let chats = [];   // store chats 

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
    } else if (type === 'Group' && chat.name !== 'Indi') {   
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
  for (let i=0; i<chats.length; i++) {
    let chat = chats[i];
    if (chat.id === chatId) {
      return chat;
    }
  }
}

// Function getChats
function getChatsContent(chatIds) {
  let userChats = []
  for (let index = 0; index < chats.length; index++) {
    let chat = chats[index];
    for (let index1 = 0; index1 < chatIds.length; index1++) {
      let chatId = chatIds[index1];
      if (chat.id === chatId) {
        userChats.push(chat);
      }
    }
  }
  return userChats;
}

// Function getChats()
function getChats() {
  return chats;
}

// Function setChats()
function setChats(newChats) {
  chats = newChats;
}

// Function setSeen()
function setSeen(obj) {
  for (let chat of chats) {
    if(chat.id === obj.chatId) {
      chat.seen.push(obj.userId)
    }
  }
}

// Function addToMute()
function addToMute(obj) {
  for (let chat of chats) {
    if (chat.id === obj.chatId) {
      chat.mute.push(obj.userId)
      break;
    }
  }
}

// Function leaveGroup()
function leaveGroup(obj) {
  for (let i=0; i<chats.length; i++) {
    let chat = chats[i];
    if (chat.id === obj.chatId) {
      let members = chat.members
      for (let j=0; j<members.length; j++) {
        let member = members[j]
        if (member === obj.userId) {
          chat.members.splice(j, 1)
          break
        }
      } 
      break;
    }
  }
}

// Export functions
module.exports = {
  getNewChatId,
  addChat,
  addMsg, 
  getChat,
  getChatsContent,
  getChats,
  setSeen,
  setChats,
  addToMute,
  leaveGroup
}
