const db = require("./db");

class Post {
  static async findAll(options = {}) {
    return db.getAllPosts();
  }
}

module.exports = Post;
