const socket = io();

// Get DOM element
let sectionSignUp = document.getElementById("signUp");

// Variables
let users = []
let userIds = []

// Get users
socket.on('usersObject', function(usersObject) {
  users = usersObject;
  console.log(users);
})

// Get user ids
socket.on('userIdsObject', function(userIdsObject) {
  userIds = userIdsObject;
})

// Clicked "Create New Account" 
sectionSignUp.addEventListener('submit', function(e) {
  e.preventDefault();

  // Get username and password
  let firstName = e.target.elements.firstName.value;
  let lastName = e.target.elements.lastName.value;
  let email = e.target.elements.email.value;
  let password = e.target.elements.password.value;

  // Check email
  let unique = true;
  for (index = 0; index < users.length; index++) {
    let user = users[index];
    if (user.email === email) {
      alert("Email exists.")
      unique = false;
    }
  }

  // Create user object
  if (unique) {
    let userId = "u" + (userIds.length+1)
    let user = {
      id : userId,
      firstName : firstName,
      lastName : lastName,
      email : email,
      password : password,
      chats : [],
      favs : []
    };
    socket.emit('newSignUp', user);           // add user to users list
    localStorage.setItem("userId", userId)    // save user id to local storage
    window.location.href = 'main.html';       // go to main page 
  }
})