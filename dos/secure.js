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
  const { id } = req.query;

  // note the try/catch here!
  // there is still a vulnerability here, but it is NOT exploitable because of the native safeguards that MongoDB has in place!
  try {
    const user = await User.findOne({ _id: id }).exec();
    if (user) {
        res.send(`User: ${user}`);
      } else {
        // this wont work, but at least it wont crash the whole system!
        res.status(401).send('Invalid username or password');
      }
  }
  catch(err) {
    res.status(400).send('Bad input');
  }

  
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
