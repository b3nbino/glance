const dbQuery = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class Glance {
  constructor(session) {
    this.username = "admin";
  }

  async getRecentPosts() {
    let result = await dbQuery("SELECT * FROM posts ORDER BY id DESC LIMIT 10");

    return result.rows;
  }

  async getFilteredPosts(tagName) {
    let result = await dbQuery(
      "SELECT * FROM posts WHERE id IN (SELECT post_id FROM posts_tags WHERE tag_name = $1) ORDER BY id DESC LIMIT 10",
      tagName
    );

    return result.rows;
  }

  async getUserPosts() {
    let result = await dbQuery(
      "SELECT * FROM posts WHERE username = $1 ORDER BY id DESC LIMIT 10",
      this.username
    );

    return result.rows;
  }

  async makePost(newPost) {
    let result = await dbQuery(
      "INSERT INTO posts (content, username) VALUES ($1, $2)",
      newPost,
      this.username
    );

    return result.rowCount > 0;
  }
};
