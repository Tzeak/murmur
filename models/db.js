const Database = require("better-sqlite3");
const path = require("path");

// Initialize database
const db = new Database(path.join(__dirname, "murmur.db"));

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function createPost(content) {
  const stmt = db.prepare("INSERT INTO posts (content) VALUES (?)");
  const result = stmt.run(content);
  return result.lastInsertRowid;
}

function getAllPosts() {
  const stmt = db.prepare(`
    SELECT * FROM posts
    ORDER BY created_at DESC
  `);
  return stmt.all();
}

function exportToMarkdown() {
  const posts = getAllPosts();
  return posts
    .map(
      (post) =>
        `## ${new Date(post.created_at).toLocaleString()}\n\n${post.content}\n`
    )
    .join("\n---\n\n");
}

module.exports = {
  createPost,
  getAllPosts,
  exportToMarkdown,
};
