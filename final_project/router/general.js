const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Function to check if the user exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  let filtered_books = Object.values(books).filter(book => book.isbn === isbn);
  if(filtered_books.length > 0){
    return res.status(200).json(filtered_books[0]);
  } else{
    return res.status(200).json({message: "Invalid ISBN"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let filtered_books = Object.values(books).filter((books) => books.author === author);
  res.send(filtered_books);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  let filtered_books = Object.values(books).filter((books) => books.title === title);
  res.send(filtered_books);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let filtered_books = Object.values(books).filter((books) => books.isbn === isbn);
  if(filtered_books.length > 0){
    res.send(filtered_books[0].reviews);
  } else{
    return res.status(300).json({message: "Invalid ISBN"});
  }
});

public_users.get('/data', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/'); // From local API
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message); // Logs error details
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


public_users.get('/data/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`); // From local API
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error : 'Failed to fetch data'});
  }
});

public_users.get('/data/author/:author', async (req, res) => {
  try{
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

public_users.get('/data/title/:title', async (req, res) => {
  try {
      const title = req.params.title;
      console.log(req.params.title);
      const response = await axios.get(`http://localhost:5000/title/${title}`); // Await the API response
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports.general = public_users;
