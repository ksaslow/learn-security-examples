const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/infodisclosure', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a Mongoose schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create a Mongoose model based on the schema
const User = mongoose.model('User', userSchema);

// Route to authenticate user (VULNERABLE TO NOSQL INJECTION)
app.get('/userinfo', async (req, res) => {
  const { username } = req.query;

  // Vulnerable code: Directly using user-provided values in the query
  const user = await User.findOne({ username: username }).exec(); // NOTE: the input is NOT SANITIZED!
  // the attacker can hijack the parameter here and get the any information they want here
  // Because we are using the variable "username" AS IS, the attacker can send it an executable query condition, rather than a string!
  // For example, if the attacker sends the username as {"$ne": null}, the query will return the first user in the database, regardless of the username provided.
  // Example: username[$ne]= says to give any username where the information NOT EQUAL TO empty, so they get all information

  // we need to WHITE LIST input (by blocking anything except the exact format we expect).
  // to secure this, we need to sanitize the username variable/input

  if (user) {
    res.send(`User: ${user}`);
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// NOTE: the METHOD = tampering, the RESULT = information disclosure!
// which security meausures can we incorporate: 
// - we chould hash the stored passwords by using a hash algorithm (rather than storing plain text passwords)!
// - or we could ensure that data in transit is also encryptyed (like using HTTPS)!
// - essentially, we need to make sure our data is encrypted, both in storage and in transit!