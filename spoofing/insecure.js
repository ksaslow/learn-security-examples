const express = require("express")
const session = require("express-session")

const app = express();
app.use(express.urlencoded({ extended: false }))

// we are creating a middleware called session that sets the session ID in the cookie of the browser. 
// because this is a middleware, it will be triggered/activated on every incoming request!
app.use(
  // session is a middleware, which is blocking access! There is authentication, but it is incorrect!
  // Why? Because as long as a client has a session ID, then the session can be spoofed, even though there
  // is this level of authentication.
  session({
    secret: "SOMESECRET", // note: the secret is HARD CODED here! bad practice
    cookie: {httpOnly: false},
    resave: false,
    saveUninitialized: false
  })
)
// threat: is the session ID is stolen, anyone can access the session data and mascarade as an Admin!!!
// see network header and look how Cookie session is set.  
// SEE mal-steal-cookie.html
// running that code displays the session ID/token. 
// we need to be sure that READ and UPDATE information is safe from spoofing attacks!!!


// only logged in and authenticated Admin users can access this route:

// This is a CSRF attack (cross-site request forgery) because the server is not validating the request.
// Remember that all cookies are sent to ANY server!! 
// in the request header, the session ID is also sent. This SHOULD be blocked, but via CSRF, the client
// is able to send a VALID session to the server!
// The key concept the attack is exploiting is that cookies are sent to any server. 
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

  // How do cookies actually get sent? What are the possibilities here w.r.t. a spoofing attack??
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
