// DOM
const divRight = document.getElementById('rightSideBar')
const pUserNameH = document.querySelector('.userNameHome');
const pUserNameS = document.querySelector('.userNameSettings');
const pChatName = document.querySelector('.chatName');
const inputSearchChats = document.getElementById('searchChats');
const ulChatList = document.getElementById('chatList');
const inputMsgInput = document.getElementById('msgInput');
const btnSendMsg = document.getElementById('sendMsg');

// 
$(document).ready(function() {
  divRight.style.visibility = 'hidden'
});

// Set current user info
const socket = io();                                  
const userId = localStorage.getItem('userId');      // Get user id
let user = ''
socket.emit('getUserInfo', userId);
socket.on('getUserInfo', function(userInfo) {
  user = userInfo;
  console.log("user info: ")
  console.log(user);

  // set user name
  pUserNameH.innerHTML = user.firstName + ' ' + user.lastName
  pUserNameS.innerHTML = user.firstName + ' ' + user.lastName
});

// Declare variables
let users = [];
let chats = [];
let currentChat = '';

// Receive 'usersObject', get users
socket.on('usersObject', function(usersObject) {
  users = usersObject;
})

// Receive chats
socket.on('chats', function(allChats) {
  chats = []
  for (i=0; i<allChats.length; i++) {
    let chat = allChats[i];
    let isMemebr = chat.members.some(function(member) {
      return member === userId
    });

    if (isMemebr) {
      chats.push(chat);
    }
  }
})

// Emit 'getChats'
socket.emit('getChats', userId);

// Receive 'getChats'
socket.on('getChats', function(userChatsContent) {
  console.log(`Chats for ${userId}:`)   
  console.log(userChatsContent)
  chats = userChatsContent;         // set chats
  loadChatsDiv();   // display chats
})

// Add new individual chat
$("#searchChats").on("click", function (event) {
  event.preventDefault();

  // get search TODO:
  let addUserId = inputSearchChats.value;
  if (addUserId  != "") {
    let newChatInfo = {
      fromUser : userId,
      toUser : addUserId
    }
    socket.emit('newIndiChat', newChatInfo);
    //loadChatsDiv(chats)
  }
});

// Function loadChatBar
function loadChatsDiv() {
  ulChatList.innerHTML = ''        // clear chat list

  // Display chats 
  //let first = true 
  for (i=0; i<chats.length; i++) {
    let chat = chats[i]
    
    // create li
    const li = document.createElement('li');
    li.id = chat.id; 
    li.onclick = function(e) {chatSelected(e);};
    let liClass;
    if (li.id === currentChat) {
      liClass = "chat-list-item list-group-item active"
    } else {
      liClass = "chat-list-item list-group-item"
    }
    li.classList = liClass

    const div = document.createElement('div');
    let divClass= "chat-list-item-wrapper row"
    div.classList = divClass

    const img = document.createElement('img');
    let src = "https://bootdey.com/img/Content/avatar/avatar1.png"
    let imgClass = "rounded-circle";
    img.src = src;
    img.classList = imgClass

    li.appendChild(div)
    div.appendChild(img)

    const p = document.createElement('p');
    p.classList = "name";
    let name;
    if (chat.name === 'Indi') {
      name = getUserName(chat.members.filter(userId1 => userId1 !== userId)[0])
    } else {
      name = chat.name
    }
    
    // name 
    p.innerText =  `${name}`    
    const span1 = document.createElement('span');

    // newMessageIcon icon
    span1.id = 'newMessageIcon'
    span1.classList = 'material-icons-outlined ml-auto'
    span1.innerHTML = 'priority_high'
    const span2 = document.createElement('span');
    
    // notOnline icon
    span2.id = 'notOnline'
    span2.classList = 'material-icons-outlined'   //TODO: add hidden
    span2.innerHTML = 'circle'
    const span3 = document.createElement('span');   
    
    // online icon
    span3.id = 'online'
    span3.classList = 'material-icons-round'
    span3.innerHTML = 'circle' 
    const span4 = document.createElement('span');   
    
    // notFavourite icon
    span4.id = 'notFavourite'
    span4.classList = 'material-icons-outlined'
    span4.innerHTML = 'star_outline'
    const span5 = document.createElement('span');   
    
    // favourite icon 
    span5.id = 'favourite'
    span5.classList = 'material-icons-outlined'
    span5.innerHTML = 'star'

    div.appendChild(p)          // name
    div.appendChild(span1)      // newMessageIcon     //TODO:  
    div.appendChild(span2)      // ofline
    //div.appendChild(span3)    // online
    div.appendChild(span4)      // notFavourite
    //div.appendChild(span5)    // favourite

    // add to chat list 
    ulChatList.appendChild(li);
  }
}

// Function getUserName()
let runOnce = true;
function getUserName(userId) {
  for (j=0; j<users.length; j++) {
    let user = users[j];
    if (user.id === userId) {
      let myName =  user.firstName + " " + user.lastName
      return myName
    }
  }
}

// Select chat 
function chatSelected(e) {
  let id = e.path[1].id
  console.log(`------------------------selected: ${id}`)
  if (stringContainsNumber(id)) {
    currentChat = id;
    loadChatsDiv();
    loadChatLog();
    socket.emit('getChat', {userId, currentChat}); 
  }
}

// Receive getChat
socket.on('getChat', function(userChatsContent) {
  //console.log(`getChat:`)   
  //console.log(userChatsContent)
  chats = userChatsContent;         // set chats
  
  // set selected chat div
  let messages;
  for(i=0; i<chats.length; i++) {
    let chat = chats[i];
    if (chat.id === currentChat) {
      messages = chat.messages
    }
  }
});

// Function 'loadChatLog'
function loadChatLog() {
  divRight.style.visibility = 'visible'
  pChatName.innerHTML = `${currentChat}`

  let messagesToDisplay = []

  for(i=0; i<chats.length; i++) {
    let chat = chats[i]
    if (chat.id === currentChat) {
      messagesToDisplay = chat.messages;
    }
  }

  //TODO: display messages in'messagesToDisplay'
  console.log('messages to display: ')
  console.log(messagesToDisplay);

}

// Send message 
$("#sendMsg").on("click", function (event) {
  event.preventDefault();
  let msgContent = inputMsgInput.value;
  if (msgContent != '') {
    console.log(`------------------------sent: '${msgContent}', from ${userId} to ${currentChat}`);
    inputMsgInput.value = '';
    inputMsgInput.focus()

    // emit message   //TODO: add time
    let msg = {
      senderId: userId,
      content : msgContent
    }
    socket.emit('sendMessage', {currentChat, msg});
  }
});

// Receive 'newMessage'
socket.on('newMessage', function(chat) {
  //console.log('------------------------received:')
  //console.log(chat);
  loadChatLog();
})

// Navigation between elements logic
$("#goToGroupSettingsButton").on("click", function (event) {
  event.preventDefault();
  $("#userSettingsSidebar").addClass("d-none");
  $("#groupSettingsSidebar").removeClass("d-none");
  $("#userChatListSidebar").addClass("d-none");
});
  
$("#goToSettingsButton").on("click", function (event) {
  event.preventDefault();
  $("#userSettingsSidebar").removeClass("d-none");
  $("#groupSettingsSidebar").addClass("d-none");
  $("#userChatListSidebar").addClass("d-none");
});
  
$(".back-arrow").on("click", function (event) {
  event.preventDefault();
  console.log("WHAAATTT");
  $("#userSettingsSidebar").addClass("d-none");
  $("#groupSettingsSidebar").addClass("d-none");
  $("#userChatListSidebar").removeClass("d-none");
});
  
$("#goToSignOutButton").on("click", function (event) {
  event.preventDefault();
  window.location.href = 'index.html';
});

// Function 'stringContainsNumber'
function stringContainsNumber(string) {
  return /\d/.test(string);    // regex
}