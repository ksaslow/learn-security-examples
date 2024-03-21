const express = require("express")
const session = require("express-session")

const app = express()
// Enter session secret key as an argument
const secret = process.argv[2];
app.use(express.urlencoded({ extended: false }))

app.use(
  session({
    secret: `${secret}`,
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

  // anything entered into the form by the user is actualy read and used by the server!
  // so a malicious attacker could type code into the form (or a hyperlink for example) into the 
  // form and the server would execute it!!!
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
