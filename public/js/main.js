const socket = io();

// Get user id
const userId = localStorage.getItem('userId');
let users = [];

// Emit getChats
socket.emit('getChats', userId);

// Receive users
socket.on('usersObject', function(usersObject) {
  users = usersObject;
})

// Receive getChats
socket.on('getChats', function(userChatsContent) {
  loadChatsDiv(userChatsContent);
})

// Function loadChatBar
function loadChatsDiv(chats) {
  console.log(chats)
  let first = true 
  for (i=0; i<chats.length; i++) {
    let chat = chats[i]
    
    // create li
    const li = document.createElement('li');
    let liClass
    if (first) {
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
    console.log(chat.name)
    if (chat.name === 'Indi') {
      name = getUserName(chat.members.filter(userId1 => userId1 !== userId)[0])
    } else {
      name = chat.name
    }
    
    p.innerText =  `${name}`    
    const span1 = document.createElement('span');
    span1.id = 'newMessageIcon'
    span1.classList = 'material-icons-outlined ml-auto'
    span1.innerHTML = 'priority_high'
    const span2 = document.createElement('span');
    span2.id = 'notOnline'
    span2.classList = 'material-icons-outlined'   //TODO: add hidden
    span2.innerHTML = 'circle'
    const span3 = document.createElement('span');   
    span3.id = 'online'
    span3.classList = 'material-icons-round'
    span3.innerHTML = 'circle' 
    const span4 = document.createElement('span');   
    span4.id = 'notFavourite'
    span4.classList = 'material-icons-outlined'
    span4.innerHTML = 'star_outline'
    const span5 = document.createElement('span');   
    span5.id = 'favourite'
    span5.classList = 'material-icons-outlined'
    span5.innerHTML = 'star'

    div.appendChild(p)
    div.appendChild(span1)
    if (first) {
      div.appendChild(span3)    // online
      first = false
    } else {
      div.appendChild(span2)    // ofline
    }

    div.appendChild(span4)
    //div.appendChild(span5)


    /*div2.innerHTML = `<p class="name">${name}</p>
    <span id="newMessageIcon" class="material-icons-outlined ml-auto">priority_high</span>
    <span id="notOnline" class="material-icons-outlined" hidden>circle</span>
    <span id="online" class="material-icons-round">circle</span>
    <span id="notFavourite" class="material-icons-outlined" hidden>star_outline</span>
    <span id="favourite" class="material-icons-outlined">star</span>`
    div.appendChild(div2);*/
    document.getElementById("chatList").appendChild(li);
  }
}

/*
<li class="chat-list-item list-group-item active">
  <div class="chat-list-item-wrapper row">
    <img src="https://bootdey.com/img/Content/avatar/avatar1.png" class="rounded-circle">
    <p class="name">Frank N. Stein</p>
    <span id="newMessageIcon" class="material-icons-outlined ml-auto">priority_high</span>
    <span id="notOnline" class="material-icons-outlined" hidden>circle</span>
    <span id="online" class="material-icons-round">circle</span>
    <span id="notFavourite" class="material-icons-outlined" hidden>star_outline</span>
    <span id="favourite" class="material-icons-outlined">star</span>
  </div>
</li>
*/

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
  console.log("DOOOOO SOMETHING HERE")
});