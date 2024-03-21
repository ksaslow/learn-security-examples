const express = require("express")
const session = require("express-session")

const app = express()
// Enter session secret key as an argument
const secret = process.argv[2];
app.use(express.urlencoded({ extended: false }))

// configure the middleware to set the session ID in the cookie of the browser to httpOnly  = TRUE!!!
// This is the secure version of how to write this code and middleware!

// how to secure the CSRF attack?
// compare the server to the hashed ID in the session.
// we need to do 2 things to make sure that session cannot be read programmatically by a malicious client! 
// 1. we set httpOnly to true. (that prevents document.cookie from being optional)
// 2. we also set sameSite to true. This prevents the session from being sent to another site!
  // note: sameSite is a strict version of CORS policy! 
  // now when we do get a request, we can say with some authority that this is a request from a valid client. 
app.use(
  session({
    secret: `${secret}`, // note: the secret is NOT hard coded here, unlike last version
    cookie: {
        httpOnly: true,
        sameSite: true,
    },
    resave: false,
    saveUninitialized: false
  })
)

app.post("/sensitive", (req, res) => {
  if (req.session.user === 'Admin') {
    req.session.sensitive = 'supersecret';
    res.send({message: 'Operation successful'});
  }
  else {
    res.send({message: 'Unauthorized Access'});
  }
})

app.get("/", (req, res) => {
  let name = "Guest"

  if (req.session.user) name = req.session.user

  res.send(`
  <h1>Welcome, ${name}</h1>
  <form action="/register" method="POST">
    <input type="text" name="name" placeholder="Your name">
    <button>Submit</button>
  </form>
  <form action="/forget" method="POST">
    <button>Logout</button>
  </form>
  `)
})

app.post("/register", (req, res) => {
  // name = req.body.name.trim()
  // res.redirect("/")
  req.session.user = req.body.name.trim()
  res.send(`<p>Thank you</p> <a href="/">Back home</a>`)
})

app.post("/forget", (req, res) => {
  req.session.destroy(err => {
    res.redirect("/")
  })
})

app.listen(8000)
