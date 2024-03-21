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
  const sanitizedName = escapeHTML(req.body.name.trim());
  req.session.user = sanitizedName;
  res.send(`<p>Thank you</p> <a href="/">Back home</a>`)
})

app.post("/forget", (req, res) => {
  req.session.destroy(err => {
    res.redirect("/")
  })
})

app.listen(8000);

// Function to HTML escape user input
function escapeHTML(input) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
// here we are taking the input the person entered into the form and making sure it is SANITIZED!
// This stops the malicious user from entering code into the form and having it run on the server!!!
// removing ANYTHING that could be interpreted as a script. 
