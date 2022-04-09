const socket = io();

// Get user id
const userId = localStorage.getItem('userId');
let users = [];

// Emit getChats
socket.emit('getChats', userId);

// Receive users
/*socket.on('usersObject', function(usersObject) {
  users = usersObject;
})*/

// Receive getChats
socket.on('getChats', function(userChatsContent) {
  loadChatsDiv(userChatsContent);
})

// Function loadChatBar
function loadChatsDiv(chats) {
  let int = 0
  for (i=0; i<chats.length; i++) {
    let chat = chats[0]
    
    // create li
    const li = document.createElement('li');
    let liClass
    if (int == 0) {
      liClass = "chat-list-item list-group-item active"
      int = 1
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
   
    let div2 = document.createElement('div');
    let name = "First Last"; 
    //let name = getUserName(chat.members[0])
    div2.innerHTML = `<p class="name">${name}</p>
    <span id="newMessageIcon" class="material-icons-outlined ml-auto">priority_high</span>
    <span id="notOnline" class="material-icons-outlined" hidden>circle</span>
    <span id="online" class="material-icons-round">circle</span>
    <span id="notFavourite" class="material-icons-outlined" hidden>star_outline</span>
    <span id="favourite" class="material-icons-outlined">star</span>`
    div.appendChild(div2);
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
function getUserName(userId) {
  console.log(userId)
  for (i=0; i<users.length; i++) {
    let user = users[i];
    console.log("-----------------")
    console.log(user)
    if (user.id === userId) {
      return user.firstName + " " + user.lastName
    }
  }
}