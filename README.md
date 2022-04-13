# SENG-513-Project: Instant Messaging Web Application

Github Reposiotry link: https://github.com/DuncanT98/SENG-513-Project

Instructions to run:
- Navigate to the root directory where the file 'server.js' is located
  - Note: 'credentials.txt' file needs to be in the same folder as 'server.js'
- In the terminal/command prompt, run 'npm install' to install all dependencies
- Run "npm start" to run the server
- Open browser to url: "localhost:3000" to start 

Project Details:
- After starting the program in browser, user may log in with existing user information or sign up and create a username and account
- User may sign in with an account after signing up as user information is stored in the database set up  through MongoDB
- Once logged in, user has access to history of conversations and may view messages as messages are also stored in the database
- User also has access to any other user who has been added before
- User may search for another user through a drop-down menu which has been implemented to assist users
- Users can add each other and message one another after adding a user through the search bar
- After adding a user, a user may mute notifications from a specific user if wanted
- User can create group chats and select other users to add to the group chat 
- All members of the group chat may message each other in the group
- Users may also share files (limited to text files) with another, this has been implemented using GridFs to store the file and share it
- Settings page is implemented where users can change username and change password, which will update the users' info in the database as well
- Sign out option is available which users can use which will direct a user back to the Log In/Sign Up page where a user may sign up with a different account or log in to an existing account using user credentials

Thank you, 
Group 12
