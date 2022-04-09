const socket = io();

// Get DOM element
let sectionSignIn = document.getElementById("signIn");

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

// SignIn
sectionSignIn.addEventListener('submit', function(e) {
  e.preventDefault();

  // Get username and password
  let email = e.target.elements.email.value;
  let password = e.target.elements.password.value;

  // chet username and password
  let valid = false;
  for (index = 0; index < users.length; index++) {
    let user = users[index];
    if (user.email === email) {
      if (user.password === password) {
        localStorage.setItem("userId", user.id)    // save user id to local storage
        window.location.href = 'main.html';
        valid = true;
      }
    }
  }

  // User does not exist
  if (!valid) {
    alert("Invalid Email or Password.")
    e.target.elements.password.value = '';
    e.target.elements.username.focus();
  }
})
