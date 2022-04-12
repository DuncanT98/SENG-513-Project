// DOM
const divRight = document.getElementById('rightSideBar')
const pUserNameH = document.querySelector('.userNameHome');
const pUserNameS = document.querySelector('.userNameSettings');
const pChatName = document.querySelector('.chatName');
const inputSearchChats = document.getElementById('searchChats');
const ulChatList = document.getElementById('chatList');
const inputMsgInput = document.getElementById('msgInput');
const btnSendMsg = document.getElementById('sendMsg');
const inputGroupName = document.getElementById('inputGroupName');
const selectUsers = document.getElementById('selectUsers')
const socket = io();  

// Set current user info                                
const userId = localStorage.getItem('userId');        // Get user id from local storage
let user = ''
socket.emit('getUserInfo', userId);                   // Tell server to send user info
socket.on('getUserInfo', function(userInfo) {         // Get user info from server
  user = userInfo;                // set user
  console.log("user info: ")
  console.log(user);

  // set username
  pUserNameH.innerHTML = user.username
  pUserNameS.innerHTML = user.username
});

// Set user status to online
socket.emit('setStatus', {id:userId, status:'online'} )
socket.on('statusChange', function(array) {
  //TODO:
  //console.log('-------------------------33 status change')
  //console.log(array)
})

// Declare variables
let users = [];
let chats = [];
let currentChatId = '';

// Receive 'usersObject', get users
socket.on('usersObject', function(usersObject) {
  users = usersObject;
})

// Emit 'getChats', tell server to send chats 
socket.emit('getChats', {userId : userId});

// Receive 'getChats', get chats from server
socket.on('getChats', function(userChatsContent) {
  console.log(`Chats for ${userId}:`)   
  console.log(userChatsContent)
  chats = []
  for (let chat of userChatsContent) {
    // place unseen chats at the top of the list
    if (!chat.seen.includes(userId)) {
      chats.unshift(chat)     // insert into the front of the array
    } else {
      chats.push(chat);       // push to the back of the array 
    }
  }
  loadChatsDiv();             // display list of chats
})

//  New sign up, get a new signup from the server 
socket.on('newSignUp', function(user) {
  console.log('-------------------------------new sign up ')
  users.push(user);
  console.log(users)
})

// Enter Command, before this was "Search Chats"
/***
 * This callback populates the selectOptions select menu with
 * chats if the user has selected Search Chats or users if the 
 * user has selected Search Users.
 */
$("#searchChats").on("change", function (event) {
  event.preventDefault();
  let option = $(this).val();

  // Dispaly user's chats
  let displayedUsers = []                       // store existing individual chats
  let chatsToDisplay = []                       // store chats to display
  let chatIdsToDisplay = []                     // store Ids of chats to display
  for (let i=0; i<chats.length; i++) {
    let chat = chats[i];
    if (chat.id[0] === 'i') {                   // individual chat
      // display username
      let recipientId = chat.members.filter(userId1 => userId1 !== userId)[0]     // get id of recipient
      let recipientName = getUsername(recipientId);                               // get username
      
      // display and store individual chat info
      chatsToDisplay.push(`${recipientName}, id = ${chat.id} `)                   
      chatIdsToDisplay.push(chat.id)
      displayedUsers.push(recipientId);
    } else {
      // display and store group chat info
      chatsToDisplay.push(`${chat.name}, (id = ${chat.id})`)
      chatIdsToDisplay.push(chat.id)
    }
  }

  // dispaly users 
  let usersToDisplay = []                                     // store users to display 
  for (let i=0; i<users.length; i++) {
    let user = users[i]
    if (!displayedUsers.includes(user.id) && user.id !== userId) {    // check existing chat does not exist and not current user 
      let username = getUsername(user.id);

      // store info 
      usersToDisplay.push(username);
    }
  }
  let options = $("#selectOptions");
  options.empty();

  let optionString;
  if (option == "Search Users") {
    options.append(`<option disabled selected data-type="user" value> -- select user -- </option>`)
    for (let username of usersToDisplay) {
        optionString = `<option data-type="user">${username}</option>`;
        options.append(optionString);
      
    }
    options.prop("disabled", false);

  } else if (option == "Search Chats") {
    options.append(`<option disabled selected data-type="chat" data-cid="" value> -- select chat -- </option>`)
    for (let i=0; i<chatsToDisplay.length; i++) {
      let chatDisplay = chatsToDisplay[i];
      let chatId = chatIdsToDisplay[i];
      console.log(chatId);
      optionString = `<option data-type="chat" data-cid="${chatId}">${chatDisplay}</option>`;
      options.append(optionString);
    }
    options.prop("disabled", false);

  } else {
    options.prop("disabled", true);

  }

});

/**
 * This callback adds a new chat if a user has selected a new user to chat with
 * and selects a displayed chat if a user has selected a new chat from the select menu
 */
$("#selectOptions").on("change", function (event) {
  event.preventDefault();
  let option = $(this).val();
  let optionType = $(this).find(':selected').data('type');
  if (optionType == "chat") {
    currentChatId = $(this).find(':selected').data('cid')
    $("#chatHistorySide").removeClass("d-none");
    $('#chatList .active').removeClass('active');
    loadChatsDiv();
    loadChatLog();
  } else if (optionType == "user") {
          // get user id
      let addUser = users.filter((user) => {return user.username === option})[0]     
      let addUserId = addUser.id                                                    
      
      // create chat
      let newChatInfo = {
        fromUser : userId,
        toUser : addUserId
      }
      socket.emit('newIndiChat', newChatInfo);
  } else {
    return;
  }
  $("#searchChats").val('Search Option').change();
});

// Get new individual chat from the server
socket.on('newIndiChat', function(obj) {
  if (userId === obj.toUser  || userId === obj.fromUser) {
    chats.unshift(obj.newChat);         // add chat to the front of chats 
    loadChatsDiv();                     // update list of chats
  }
})

// Display list of chats
function loadChatsDiv() {
  ulChatList.innerHTML = ''        // clear chat list

  // Display chats 
  for (let j=0; j<chats.length; j++) {    //TODO: why does i not work 
    let chat = chats[j]
    
    // create li
    const li = document.createElement('li');
    li.id = chat.id; 
    let liClass;
    if (li.id === currentChatId) {
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
      name = getUsername(chat.members.filter(userId1 => userId1 !== userId)[0])
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
    span2.classList = 'material-icons-outlined'   //TODO: add hidden?
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

    // Check if chat was seen
    if (!chat.seen.includes(userId)) {
      div.appendChild(span1)          // newMessageIcon     //TODO: fix?
    } else {
      span2.classList.add('ml-auto');  // ofline
      span3.classList.add('ml-auto')   // online
    }


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

// Return username given a user id
function getUsername(userId) {
  for (let user of users) {
    if (user.id === userId) {
      return  user.username;
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
    currentChatId = id;
    loadChatsDiv();
    loadChatLog();
  }
}

// Function 'loadChatLog'
/**
 * Loads the currently selected chat messages into the messages element with
 * grey text for non user and green text for current user. Sender name is also
 * displayed for group chats.
 */
function loadChatLog() {
  // add user to 'seen' list in chat
  for(let chat of chats) {
    if (chat.id === currentChatId) {
      chat.seen.push(userId);
      socket.emit('seen', {userId:userId, chatId:currentChatId})
      loadChatsDiv();
      break;
    }
  }

  //TODO: comment
  for(let i=0; i<chats.length; i++) {
    let chat = chats[i]
    if (chat.id === currentChatId) {
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
            senderName = getUsername(message.senderId);
        }
        else {
          senderName = "";
        }
        
        let time = '2:33 am'    //TODO: implement time
        let htmlString = `<li class="list-group-item border-0 ${alignment}"><div>${senderName}</div>
        <div class="${bk_color} d-inline-block rounded py-2 px-3 mr-3">${message.content}<div class="text-muted small text-nowrap m-2 float-right">${time}</div></div></li>`;
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
  let msgContent = inputMsgInput.value;
  if (msgContent != '') {
    console.log(`------------------------sent: '${msgContent}', from ${userId} to ${currentChatId}`);
    inputMsgInput.value = '';
    inputMsgInput.focus()

    // emit message   //TODO: add time
    let msg = {
      senderId: userId,
      content : msgContent
    }
    socket.emit('sendMessage', {chatId:currentChatId, msg:msg});
  }
});

// Receive 'newMessage'
socket.on('newMessage', function(updatedChat) {
  // update chats
  for (i=0; i<chats.length; i++) {      // TODO: better way?
    let chat = chats[i];
    if (chat.id === updatedChat.id) {
      console.log('------------------------received:')
      console.log(chat);
      chats.splice(i, 1);
      if(chat.id === currentChatId) {
        //chat.showNotification = false;
        chat.seen.push(userId);
        socket.emit('seen', {userId:userId, chatId:currentChatId})
      }
      chats.unshift(updatedChat); 
      loadChatsDiv();
      break;
    }
  }

  if (updatedChat.id === currentChatId) {
    loadChatLog();
  }

})

// Function 'stringContainsNumber'
function stringContainsNumber(string) {
  return /\d/.test(string);    // regex
}

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

  // set select users
  selectUsers.innerHTML = '';

  // TODO: currently, you can create multiple groups with the same users
  for (let user of users) {
    if (user.id !== userId) {
      let option = document.createElement('option');
      option.id = user.id
      option.innerHTML = user.username
      selectUsers.appendChild(option)
    }
  }
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
  //TODO: Actually sign out user!
});

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

/**
 * In Settings, clicking 'Change Username" will open a modal TODO:
 */
 $("#btnChangeUsername").on("click", function (event) {
  event.preventDefault();
  console.log("Change username selected.");
  const input = prompt("Enter new username:");
  socket.emit('changeUsername', {userId: userId, newUsername:input});
  alert('Username changed.');
  //TODO: reload chat with new username
  //TODO: check username is unique
});

// Change password
$("#btnChangePassword").on("click", function (event) {
  event.preventDefault();
  let input = prompt("Enter password:");
  if (user.password === input) {
    input = prompt("Enter new password:");
    alert('Password changed.');
    socket.emit('changePassword', {userId: userId, newPassword:input});
  } else {
    alert('Incorrect password.');
  }
});

// Create group
 $("#btnCreateGroup").on("click", function (event) {
  event.preventDefault();
  let good = true;

  // get group name
  let groupSubject =  inputGroupName.value;
  if (groupSubject === '') {
    alert('Group subject cannot be empty.')
    good = false;
  }

  // get group members
  let selected = [];
  for (let option of selectUsers.options) {
    if (option.selected) {
      selected.push(option.id);
      if (good) {
        option.selected = false;
      }
    }
  }
  if (selected.length === 0) {
    alert('Group subject cannot be empty.')
    good = false;
  }
  
  // emit new group
  if (good) {
    console.log(`---------------------------created new group '${groupSubject}' with:`)
    selected.push(userId)
    console.log(selected)
    socket.emit('newGroup', {selected : selected, name:groupSubject})
    inputGroupName.value = '';
  }
  
  // close 'New Group' section
});

// Receive 'newGroupChat'
socket.on('newGroupChat', function(info) {
  if (info.selected.includes(userId)) {
    chats.unshift(info.newChat);
    console.log('----------------------511')
    console.log(chats)
    loadChatsDiv();
  }
})

// view members
$("#btnViewMembers").on("click", function (event) {
  console.log('-------------------view members selected')
  event.preventDefault();
  for (let chat of chats) {
    if (chat.id === currentChatId) {
      alert(chat.members)
    }
  }
});

// mute notifucations
$("#btnMute").on("click", function (event) {
  console.log('-------------------mute selected')
  event.preventDefault();
  //TODO:
});