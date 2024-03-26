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

// Route to authenticate user (SECURE AGAINST NOSQL INJECTION)
app.get('/userinfo', async (req, res) => {
  const { username } = req.query;

  // Input validation: Ensure username is a string
  if (typeof username !== 'string') {
    return res.status(400).send('Invalid username format');
  }

  // Sanitize username input: Prevent NoSQL injection --> THIS IS THE FIX to the insecure.js code. If anything is not a word or a space, it will be removed.
  const sanitizedUsername = username.replace(/[^\w\s]/gi, ''); // Remove non-alphanumeric characters
  // ensuring that only usernames without alphanumerical characters are allowed!
  // this also has to be defined in the requirements! 
  // "This is secure with regard to ...." a specific threat. In this case, this is secure w.r.t. information disclosure!

  // Perform database query using sanitized username
  try {
    const user = await User.findOne({ username: sanitizedUsername }).exec();

    if (user) {
      res.send(`User: ${user}`);
    } else {
      res.status(401).send('Invalid username');
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
