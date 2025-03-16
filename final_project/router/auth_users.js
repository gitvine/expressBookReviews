const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user) => {
  return user.username === username;
});
return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/auth/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  console.log("Reached");
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.body.review;
  let filtered_books = Object.values(books).filter((books) => books.isbn === isbn);
  if(filtered_books.length > 0){
    for (let key in books) {
      if (books[key].isbn === isbn) {
          books[key].reviews[username] = review;
          console.log(`Review added for user ${username}: ${review}`);
          return res.status(300).json({message: `Review added for user ${username}: ${review}`});
      }  
  }
  } else{
    return res.status(300).json({message: "Invalid ISBN"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  let filtered_books = Object.values(books).filter((books) => books.isbn === isbn);
  if(filtered_books.length > 0){
    for (let key in books) {
      if ((books[key].isbn === isbn) && (books[key].reviews[username])) {
          console.log("found the review");
          delete books[key].reviews[username];
          console.log(`Review deleted for user ${username}`);
          return res.status(300).json({message: `Review deleted for user ${username}`});
      }
      return res.status(300).json({message: `Review not found for user ${username}`});
  }
  } else{
    return res.status(300).json({message: "Invalid ISBN"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
