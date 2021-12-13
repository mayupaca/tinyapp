const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ["I love cats.", "I also love dogs."]
}))


const salt = bcrypt.genSaltSync(10);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync(process.env.USER_RANDOM_ID, salt),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync(process.env.USER_RANDOM2_ID, salt),
  },
};

users.user2RandomID.id

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

const urlsForUserId = function (id) {
  const result = {};
  for (let shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if (urlObj.userID === id) {
      result[shortURL] = urlObj;
    }
  }
  return result;
};

const findExistingUser = function (email) {
  for (const user in users) {
    console.log(users[user]);
    if (users[user].email === email) {
      return user;
    }
  }
};

app.post("/register", (req, res) => {
  const newUserId = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hash(req.body.password, salt);
  const user = {
    id: newUserId,
    email: email,
    password: password,
  };

  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }

  if (findExistingUser(email)) {
    return res.status(400).send("a user with that email already exists");
  }

  users[newUserId] = user;
  req.session.user_id = newUserId;
  // res.cookie("user_id", newUserId, { maxAge: 60000, httpOnly: false });
  // ("key", value, { maxAge: 60000, httpOnly: false })
  console.log(users[newUserId]);
  res.redirect("/urls");
});
// users[id].id  => access users[id] value
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password; 
  const user = findExistingUser(email);

  if (!user) {
    return res.status(403).send("a user with that email doesn't exist");
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("your password doesn't match");
  }

  req.session.user_id = user_id;
  res.redirect("/urls");
  console.log(req.body)
});

app.post("/logout", (req, res) => {
  req.session["user_id"] = null;
  res.redirect("/urls");
  // res.clearCookie("user_id");
  // res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session["user_id"]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("You can not delete this URL!");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = {
    user: users[userID],
    urls: urlsForUserId(userID),
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  const urlsOfUser =
    urlDatabase[shortURL] && urlDatabase[shortURL].userID === userID;
  if (!userID) {
    return res.status(400).send("You are not logged in.");
  }
  if (!urlsOfUser) {
    return res.status(400).send("No matching URL found.");
  }
  const templateVars = {
    user: users[userID],
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/dashboard", (req, res) => {
  res.json(users);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


