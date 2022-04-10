// DOM
const inputSearchChats = document.getElementById('searchChats');
const ulChatList = document.getElementById('chatList');
const inputMsgInput = document.getElementById('msgInput');
const btnSendMsg = document.getElementById('sendMsg');

// socket.io
const socket = io();

// Get user id
const userId = localStorage.getItem('userId');

// Declare variables
let users = [];
let chats = [];
let currentChat;
let firstSignIn = true; 

// Emit getChats
socket.emit('getChats', userId);

// Receive users
socket.on('usersObject', function(usersObject) {
  users = usersObject;
})

// Receive getChats
socket.on('getChats', function(userChatsContent) {
  console.log("----------------------22 getChats")
  console.log(userChatsContent)
  chats = userChatsContent;         // set chats
  if (firstSignIn) {
    currentChat = userChatsContent[0].id;
    firstSignIn = false;
  }
  loadChatsDiv();   // display chats
})

// Receive getChat
socket.on('getChat', function(userChatsContent) {
  console.log("----------------------39 getChat")
  console.log(userChatsContent)
  chats = userChatsContent;         // set chats
  
  // set selected chat div
  let messages;
  for(i=0; i<chats.length; i++) {
    let chat = chats[i];
    if (chat.id === currentChat) {
      messages = chat.messages
    }
  }
  console.log("----------------------51 messages")
  console.log(messages);
});

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
    div.appendChild(span1)      // newMessageIcon
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

// Select chat logic
function chatSelected(e) {
  let id = e.path[1].id
  currentChat = id;
  console.log(`selected: ${currentChat}`)
  loadChatsDiv();
  //TODO: load chat
  socket.emit('getChat', {userId, currentChat}); 
}

// 
$("#sendMsg").on("click", function (event) {
  event.preventDefault();
  if (inputMsgInput.value != '') {
    console.log(`send: '${inputMsgInput.value}', from ${userId} to ${currentChat}`);
    inputMsgInput.value = '';
    inputMsgInput.focus()
  }
});

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