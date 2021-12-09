const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// "view engine" プロパティはどのテンプレートエンジンを使うかの指定を行うプロパティ
app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
// Get rundom 6 characters
const generateRandomString = function () {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randStr = "";
  for (var i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randStr;
};

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  console.log(req.cookies["user_id"])
  console.log(users)
  res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; 
  const user = {
    id: newUserId,
    email: email,
    password: password,
  };
  
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  
  const findExistingUser = function(email) {
    for (const user in users) {
      console.log(users[user]);
      if (users[user].email === email) {
        return user;
      }
    }
  };
  
  if (findExistingUser(email)) {
    return res.status(400).send("a user with that email already exists");
  }
  
  users[newUserId] = user;
  res.cookie("user_id", newUserId);
  console.log(users[newUserId]);
  res.redirect("/urls");
});
// users[id].id  => access users[id] value
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 

  const findExistingUser = function (email) {
    for (const user in users) {
      console.log(users[user]);
      if (users[user].email === email) {
        return users[user];
      }
    }
  };
  const user = findExistingUser(email);

  if (!user) {
    return res.status(403).send("a user with that email doesn't exist");
  }

  if (user.password !== password) {
    return res.status(403).send("your password doesn't match");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
  console.log(req.body)
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"],
  shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  console.log(urlDatabase[shortURL]);
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  if (!users[userID].email) {
    return res.send("You need to log in or register.");
  }
});

const urlsForUser = function(id) {

};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(req.params);
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


