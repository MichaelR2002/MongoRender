const { MongoClient } = require("mongodb");
const user = "Mike";
const password = "Password";
const mongoURI = `mongodb+srv://Mike:Password@cluster0.ecs4ysq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const express = require("express");
const cookieParser = require("cookie-parser");
const mongodb = require("mongodb");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const dbName = "Authentication";
const collectionName = "Login";

mongodb.MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // CSS styling for the pages in the web presentation
    const mainPageStyles = `
      body {
        background-color: #212529;
        color: #fff;
        font-family: 'Roboto', sans-serif;
        padding: 20px;
      }
      a {
        color: #ffcc00;
        text-decoration: none;
        display: block;
      }
      a:hover {
        color: #ffd633;
      }
    `;

    // cookie auth for the login page
    app.get("/", (req, res) => {
      const authCookie = req.cookies.auth;
      if (!authCookie) {
        //more CSS styling for the login page
        res.send(`
          <style>
            ${mainPageStyles}
            form {
              margin-bottom: 20px;
            }
            label {
              display: block;
              margin-bottom: 5px;
              color: #ffcc00;
            }
            input[type="text"],
            input[type="password"],
            button {
              width: 100%;
              padding: 10px;
              margin-bottom: 10px;
              border: none;
              border-radius: 5px;
            }
            button {
              background-color: #ffcc00;
              color: #333;
              cursor: pointer;
            }
            button:hover {
              background-color: #ffd633;
            }
          </style>
          <h1>Login or Sign-up, or dont...thats ok to i guess</h1>
          <form action="/login" method="post">
            <label for="userID">Enter Your Username:</label>
            <input type="text" id="userID" name="userID" required>
            <label for="password">Enter Your Password:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Login</button>
          </form>
          <form action="/sign-up" method="post">
            <label for="userID">New Username:</label>
            <input type="text" id="userID" name="userID" required>
            <label for="password">New Password:</label>
            <input type="password" id="password" name="password" required>
            <button type="submit">Sign-Up</button>
          </form>
          <a href="/cookies">Let me see the Cookies</a>
        `);
      } else {
        //sends logged in users to the cookie page when cookies are not cleared
        res.send(`
          <style>
            ${mainPageStyles}
          </style>
          <h1>Logged In!</h1>
          <p>Cookie: ${authCookie}</p>
          <a href="/cookies">Let me see the Cookies</a>
        `);
      }
    });

    //shows the code for logging a user in,
    //if records match, it creates the cookie and sends you to the home route,
    //if not it sends you the not logged in route
    app.post("/login", (req, res) => {
      const { userID, password } = req.body;
      collection
        .findOne({ userID, password })
        .then((user) => {
          if (user) {
            res.cookie("auth", userID, { maxAge: 60000 }); // Expires in 1 minute
            res.redirect("/");
          } else {
            res.send(`
              <h2>Your credentials did not match our records!</h2>
              <a href="/">Go Back.</a>
            `);
          }
        })
        .catch((error) => console.error(error));
    });

    //code to send a user to the signup page once account is created.
    app.post("/sign-up", (req, res) => {
      const { userID, password } = req.body;
      collection
        .insertOne({ userID, password })
        .then((result) => {
          res.send(`
            <h2>Account Created</h2>
            <a href="/">Take Me To The Login Page!</a>
          `);
        })
        .catch((error) => console.error(error));
    });

    //cookie auth stuffs
    app.get("/cookies", (req, res) => {
      const authCookie = req.cookies.auth;
      const cookieMessage = authCookie ? `Cookie: ${authCookie}` : "There are no cookies";
      let links = "";
      if (authCookie) {
        links = `
          <a href="/clear-cookies">CLEAR THE COOKIES NOW!</a>
        `;
      }
      //shows the cookies, and also applies the CSS styles to this page aswell
      res.send(`
        <style>
          ${mainPageStyles}
        </style>
        <h1>Show me the Cookies</h1>
        <p>${cookieMessage}</p>
        ${links}
        <a href="/">Home</a>
      `);
    });

    // Gives a message when the cookies have been terminated
    app.get("/clear-cookies", (req, res) => {
      res.clearCookie("auth");
      res.send(`
        <style>
          ${mainPageStyles}
        </style>
        <h1>Cookies Terminated</h1>
        <a href="/cookies">Let me see the Cookies</a>
        <a href="/">Home</a>
      `);
    });

    //port stuffs
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const port = 3000;
    console.log("Server running on http://localhost:" + port);
  })
  .catch((error) => console.error(error));
