const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');

//app.use(cookieParser());

// Assume the server is malicious. Doesn't do anything useful. Only changes cookies.
app.get("/malhome", (req, res) => {
  res.send(`<h1> You Won! </h1><script> console.log("Session = " + document.cookie); </script>`)
})

// the reason the server was able to steal the session ID is because it could READ the document.cookie. It was easily accessible!
// How can we make this INACCESSIBLE to the server???
// NOTE: in dev tools > Application > Cookies, you can see the session ID. and can see that the cookie is NOT SET to HTTPONLY! 
// It makes sense to enable this because the ONLY person who should be able to READ AND CHANGE the session is the SERVER! Not the client!!!


app.listen(8001);
