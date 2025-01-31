const express = require("express");
const morgan = require("morgan");
const glanceDBI = require("./lib/glanceDBI");
const session = require("express-session");
const store = require("connect-loki");
const { formatDate } = require("./lib/routeMethods");

const app = express();
const HOST = "localhost";
const PORT = "5500";
const LokiStore = store(session);

//Views settings
app.set("view engine", "pug");
app.set("views", "views");

//Logger
app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in millseconds
      path: "/",
      secure: false,
    },
    name: "ls-forum-session-id",
    resave: false,
    saveUninitialized: true,
    secret: "something",
    store: new LokiStore({}),
  })
);

//Set db api
app.use((req, res, next) => {
  res.locals.store = new glanceDBI(req.session);
  next();
});

function formatPosts(posts) {
  if (posts.length === 0) {
    posts = false;
  } else {
    //Formats date for display
    posts.forEach((post) => {
      formatDate(post);
    });
  }
  return posts;
}

//Initial redirect
app.get("/", (req, res) => {
  res.redirect("/home");
});

//Request handling
app.get("/home", async (req, res) => {
  let posts = await res.locals.store.getRecentPosts();
  posts = formatPosts(posts);

  res.render("home", {
    posts,
  });
});

app.get("/profile", async (req, res) => {
  res.render("profile");
});

app.get("/post", async (req, res) => {
  res.render("make-post");
});

//Server startup
app.listen(PORT, HOST, () => {
  console.log(`Server Listening on ${HOST}:${PORT}`);
});
