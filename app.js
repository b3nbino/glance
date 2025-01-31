//Import packages
const express = require("express");
const morgan = require("morgan");
const glanceDBI = require("./lib/glanceDBI");
const session = require("express-session");
const store = require("connect-loki");
const { formatDate } = require("./lib/routeMethods");
const flash = require("express-flash");
const { body, validationResult } = require("express-validator");

//Create our server and environment variables
const app = express();
const HOST = "localhost";
const PORT = "5500";
const LokiStore = store(session);

//Views settings
app.set("view engine", "pug");
app.set("views", "views");

//Middlewear
app.use(morgan("common")); //Logger
app.use(express.static("public")); //Set public folder
app.use(express.urlencoded({ extended: false }));
//Sends a cookie
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
app.use(flash());

//Set db api
app.use((req, res, next) => {
  res.locals.store = new glanceDBI(req.session);
  next();
});

//Preserve session info
app.use((req, res, next) => {
  //Make flash message persist
  res.locals.flash = req.session.flash;
  delete req.session.flash;
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

app.get("/view/post/:postId", async (req, res) => {
  //Get post and comments and format their dates
  let postId = req.params.postId;
  let currPost = await res.locals.store.getPost(postId);
  formatDate(currPost);
  let currPostComments = (await res.locals.store.getPostComments(postId)) ?? {};
  currPostComments = formatPosts(currPostComments);

  if (!currPost) {
    throw new Error("Post not found");
  }

  res.render("post", {
    currPost,
    currPostComments,
  });
});

app.get("/profile", async (req, res) => {
  res.render("profile");
});

app.get("/post", async (req, res) => {
  res.render("make-post");
});

app.get("/post/comment/:postId", async (req, res) => {
  let postId = req.params.postId;
  let currPost = await res.locals.store.getPost(postId);

  if (!currPost) {
    throw new Error("Post not found");
  }

  formatDate(currPost);

  res.render("make-comment", {
    currPost,
  });
});

//Handles post creation request
app.post(
  "/create/post",
  [
    body("postContent")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Post must have at least 1 character.")
      .isLength({ max: 256 })
      .withMessage("Post must have at most 256 character."),
  ],
  async (req, res) => {
    let postContent = req.body.postContent;
    let errors = validationResult(req);

    if (errors.isEmpty()) {
      let postCreated = await res.locals.store.makePost(postContent);

      if (!postCreated) {
        throw new Error("Post not created");
      }

      //Add success message to flash
      req.flash("success", "Post created!");
      res.redirect("/home");
    } else {
      //Add error messages to flash
      errors.array().forEach((err) => req.flash("error", err.msg));

      res.render("make-post", {
        flash: req.flash(),
        postContent,
      });
    }
  }
);

app.post(
  "/create/comment/:postId",
  [
    body("commentText")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Reply must have at least 1 character.")
      .isLength({ max: 256 })
      .withMessage("Reply cannot have more than 256 characters."),
  ],
  async (req, res) => {
    //Get current post and comment info
    let postId = req.params.postId;
    let commentText = req.body.commentText;
    let currPost = await res.locals.store.getPost(postId);

    if (!currPost) {
      throw new Error("Post not found.");
    }

    formatDate(currPost);

    let errors = validationResult(req);

    if (errors.isEmpty()) {
      let commentCreated = await res.locals.store.makeComment(
        commentText,
        postId
      );

      if (!commentCreated) {
        throw new Error("Comment failed.");
      }

      req.flash("success", "Comment created!");
      res.redirect(`/view/post/${postId}`);
    } else {
      errors.array().forEach((err) => req.flash("error", err.msg));

      res.render("make-comment", {
        currPost,
        flash: req.flash(),
      });
    }
  }
);

//Error handler
app.use((error, req, res, _next) => {
  console.log(error);
  res.status(404).render("error", { error: error });
});

//Server startup
app.listen(PORT, HOST, () => {
  console.log(`Server Listening on ${HOST}:${PORT}`);
});
