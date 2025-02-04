const dbQuery = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class Glance {
  constructor(session) {
    this.username = "admin";
  }

  //Gets a certain post using the post id
  async getPost(postId) {
    let result = await dbQuery("SELECT * FROM posts WHERE id = $1", postId);

    return result.rows[0];
  }

  //Gets all comments associated with a post
  async getPostComments(postId) {
    let result = await dbQuery(
      "SELECT * FROM comments WHERE post_id = $1 ORDER BY date_created DESC",
      postId
    );

    return result.rows;
  }

  //Retreives 10 most recent posts
  async getRecentPosts() {
    let result = await dbQuery("SELECT * FROM posts ORDER BY id DESC LIMIT 10");

    return result.rows;
  }

  //Retrieves post with a certain tag
  async getFilteredPosts(tagName) {
    let result = await dbQuery(
      "SELECT * FROM posts WHERE id IN (SELECT post_id FROM posts_tags WHERE tag_name = $1) ORDER BY id DESC LIMIT 10",
      tagName
    );

    return result.rows;
  }

  //Retrieves posts from the current user
  async getUserPosts() {
    let result = await dbQuery(
      "SELECT * FROM posts WHERE username = $1 ORDER BY id DESC LIMIT 10",
      this.username
    );

    return result.rows;
  }

  //Adds post
  async makePost(newPost) {
    //Adds post to post table
    let result = await dbQuery(
      "INSERT INTO posts (content, username) VALUES ($1, $2)",
      newPost,
      this.username
    );

    return result.rowCount > 0;
  }

  //Adds comment
  async makeComment(commentText, postId) {
    //Adds comment to comments table
    let result = await dbQuery(
      "INSERT INTO comments (comment_text, post_id, username) VALUES ($1, $2, $3)",
      commentText,
      postId,
      this.username
    );

    return result.rowCount > 0;
  }

  //Adds like
  async likePost(postId) {
    //Adds post to users_likes table
    let liked = await dbQuery(
      "INSERT INTO users_likes VALUES ($1, $2)",
      postId,
      this.username
    );

    //Increments amount of likes in posts table
    let increment = await dbQuery(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1",
      postId
    );

    return liked.rowCount > 0 && increment.rowCount > 0;
  }

  //Removes like
  async unlikePost(postId) {
    //Removes post from users_likes table
    let unliked = await dbQuery(
      "DELETE FROM users_likes WHERE post_id = $1 AND username = $2",
      postId,
      this.username
    );

    //Subtracts 1 from post's likes
    let decrement = await dbQuery(
      "UPDATE posts SET likes = likes - 1 WHERE id = $1",
      postId
    );

    return unliked.rowCount > 0 && decrement.rowCount > 0;
  }

  async getLikes() {
    let result = await dbQuery(
      "SELECT post_id FROM users_likes WHERE username = $1",
      this.username
    );

    return result.rows;
  }
};
