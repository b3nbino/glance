const express = require("express");
const app = express();
const HOST = "localhost";
const PORT = "5005";

//Configure views
app.set("view engine", "pug");
app.set("views", "views");

//Middlewear
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

//Initial redirect
app.get("/", (req, res) => {
  res.redirect("/home");
});

//Request handlers
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/notifications", (req, res) => {
  res.render("notifications");
});

app.get("/messages", (req, res) => {
  res.render("messages");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

//Start server listening for requests
app.listen(PORT, HOST, () => {
  console.log(`Server live on: ${HOST}:${PORT}`);
});
