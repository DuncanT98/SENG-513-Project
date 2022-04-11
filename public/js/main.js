// DOM
const divRight = document.getElementById('rightSideBar')
const pUserNameH = document.querySelector('.userNameHome');
const pUserNameS = document.querySelector('.userNameSettings');
const pChatName = document.querySelector('.chatName');
const inputSearchChats = document.getElementById('searchChats');
const ulChatList = document.getElementById('chatList');
const inputMsgInput = document.getElementById('msgInput');
const btnSendMsg = document.getElementById('sendMsg');


$(document).ready(function() {
  //divRight.style.visibility = 'hidden'
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
    let liClass;
    if (li.id === currentChat) {
      liClass = "chat-list-item list-group-item list-group-item-action active"
    } else {
      liClass = "chat-list-item list-group-item list-group-item-action";
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
  // Clicking a chat history calls the chatSelected method
  $("#chatList .list-group-item").click(chatSelected);

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

/**
 * When a chat is selected, get the id from the element and
 * request the chat messages from the server
 * @param {event} e 
 */ 
function chatSelected(e) {
  console.log(e);
  $("#chatHistorySide").removeClass("d-none");
  // Switch active class to currently clicked element
  $('#chatList .active').removeClass('active');
  $(this).toggleClass("active");
  let id = $(this).attr("id");
  console.log(`------------------------selected: ${id}`);
  if (stringContainsNumber(id)) {
    currentChat = id;
    loadChatsDiv();
    socket.emit('getChat', {userId, currentChat}); 
  }
}


// Receive getChat
socket.on('getChat', function(userChatsContent) {
  console.log(`getChat:`)   
  console.log(userChatsContent)
  chats = userChatsContent;         // set chats
  loadChatLog();

});

// Function 'loadChatLog'
/**
 * Loads the currently selected chat messages into the messages element with
 * grey text for non user and green text for current user. Sender name is also
 * displayed for group chats.
 */
function loadChatLog() {
  let messagesToDisplay = []
  for(i=0; i<chats.length; i++) {
    let chat = chats[i]
    if (chat.id === currentChat) {
      let messages = $("#messages");
      messages.empty();
      for (let message of chat.messages) {
        let alignment;
        let bk_color;
        // Set background color of message based on sender
        if (userId == message.senderId) {
          alignment = "align-self-end";
          bk_color = "bk-l-green";
        } else {
          alignment = "align-self-start";
          bk_color = "bg-light";
        }
        // add names to chat messages if its a group chat
        if (chat.id[0] == "g") {
            senderName = getUserName(userId);
        }
        else {
          senderName = "";
        }
        
        let htmlString = `<li class="list-group-item border-0 ${alignment}"><div>${senderName}</div>
        <div class="${bk_color} d-inline-block rounded py-2 px-3 mr-3">${message.content}<div class="text-muted small text-nowrap m-2 float-right">2:33 am</div></div></li>`;
        messages.append(htmlString);
        }
        $("#messagesWrapper").animate({
            scrollTop: $("#messagesWrapper")[0].scrollHeight
        }, 500
        );
        $("#rightSideBar").removeClass("d-none");
        $("#rightSideBar").addClass("d-block");
        $("#leftSideBar").removeClass("d-block");
        $("#leftSideBar").addClass("d-none");
        break;
      }
    
    }
}

// Send message 
$("#sendMsg").on("click", function (event) {
  event.preventDefault();
  console.log(event);
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
  console.log('------------------------received:')
  console.log(chat);
  loadChatLog();
})

// Navigation between elements logic
/**
 * Clicking the Group Settings option in the drop down menu will go to the
 * Group Settings
 */
$("#goToGroupSettingsButton").on("click", function (event) {
  event.preventDefault();
  $("#userSettingsSidebar").addClass("d-none");
  $("#groupSettingsSidebar").removeClass("d-none");
  $("#userChatListSidebar").addClass("d-none");
});
  
/**
 * Clicking the User Settings option in the drop down menu will go to the
 * User Settings
 */
$("#goToSettingsButton").on("click", function (event) {
  event.preventDefault();
  $("#userSettingsSidebar").removeClass("d-none");
  $("#groupSettingsSidebar").addClass("d-none");
  $("#userChatListSidebar").addClass("d-none");
});
 
/**
 * Clicking the back arrow from User or Group Settings will go to the
 * List of Chats
 */
$("#leftSideBarContainer .back-arrow").on("click", function (event) {
  event.preventDefault();
  console.log("WHAAATTT");
  $("#userSettingsSidebar").addClass("d-none");
  $("#groupSettingsSidebar").addClass("d-none");
  $("#userChatListSidebar").removeClass("d-none");
});
 
/**
 * Clicking the sign out button from the drop down menu will sign out the user.
 */
$("#goToSignOutButton").on("click", function (event) {
  event.preventDefault();
  window.location.href = 'index.html';
  //TODO Actually sign out user!
});

// Function 'stringContainsNumber'
function stringContainsNumber(string) {
  return /\d/.test(string);    // regex
}

/**
 * On the ChatHistory side in the mobile version, clicking the back
 * arrow will return the display to the list of chats
 */
$("#chatHistorySide .back-arrow").on("click", function (event) {
  event.preventDefault();
  $("#rightSideBar").addClass("d-none")
  $("#rightSideBar").removeClass("d-block")
  $("#leftSideBar").addClass("d-block")
  $("#leftSideBar").removeClass("d-none")
});
