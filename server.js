const express = require("express");
const path = require("path");
const db = require("./models/db");
const contactManager = require("./models/contacts");

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json());

// Serve static files from the React app in production
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
}

// API Routes
app.post("/api/posts", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    const postId = await db.createPost(content);
    res.status(201).json({ id: postId, content });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await db.getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/api/export", async (req, res) => {
  try {
    const { start, end } = req.query;
    let posts = await db.getAllPosts();

    // Filter by date range if provided
    if (start || end) {
      const startDate = start ? new Date(start) : new Date();
      const endDate = end ? new Date(end) : new Date();

      // Set start date to beginning of day
      startDate.setHours(0, 0, 0, 0);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);

      posts = posts.filter((post) => {
        const postDate = new Date(post.created_at);
        return postDate >= startDate && postDate <= endDate;
      });
    } else {
      // Default to previous day if no dates provided
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      posts = posts.filter((post) => {
        const postDate = new Date(post.created_at);
        return postDate >= yesterday && postDate < today;
      });
    }

    // Reverse the order of posts and change bullet points to hyphens
    const content = posts
      .reverse()
      .map((post) => `- ${post.content}`)
      .join("\n");
    res.json({ content });
  } catch (error) {
    console.error("Error exporting posts:", error);
    res.status(500).json({ error: "Failed to export posts" });
  }
});

// Contact API Routes
app.get("/api/contacts", (req, res) => {
  try {
    const contacts = Array.from(contactManager.contacts.values()).map(
      (contact) => ({
        ...contact,
        aliases: Array.from(contact.aliases),
      })
    );
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.get("/api/contacts/search", (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const matches = contactManager.findContact(q);
    res.json(matches);
  } catch (error) {
    console.error("Error searching contacts:", error);
    res.status(500).json({ error: "Failed to search contacts" });
  }
});

// Serve React app in production
if (NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
});
