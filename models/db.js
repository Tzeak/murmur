const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, "../data/murmur.db"));

// Initialize database schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

function createPost(content) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("INSERT INTO posts (content) VALUES (?)");
    stmt.run(content, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    stmt.finalize();
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT * FROM posts
      ORDER BY created_at DESC
    `,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

function exportToMarkdown() {
  return new Promise((resolve, reject) => {
    getAllPosts()
      .then((posts) => {
        const markdown = posts
          .map(
            (post) =>
              `## ${new Date(post.created_at).toLocaleString()}\n\n${
                post.content
              }\n`
          )
          .join("\n---\n\n");
        resolve(markdown);
      })
      .catch(reject);
  });
}

module.exports = {
  createPost,
  getAllPosts,
  exportToMarkdown,
};
