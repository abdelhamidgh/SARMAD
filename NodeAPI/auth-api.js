// auth-api.js
// Backend API for ExoQuest Authentication System
// Dependencies: express, mssql, bcrypt, jsonwebtoken, dotenv

const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors"); // Add this
require("dotenv").config();

const app = express();

// Add CORS middleware BEFORE other middleware
app.use(
  cors({
    origin: "http://localhost:8080", // Change this to 8080!
    credentials: true,
  })
);

app.use(express.json());

// SQL Server Configuration
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "ExoQuestDB",
  server: process.env.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // For Azure
    trustServerCertificate: true, // For local dev
  },
};

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Database connection pool
let pool;

// Initialize database connection
async function initializeDatabase() {
  try {
    pool = await sql.connect(sqlConfig);
    console.log("Connected to SQL Server successfully");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Signup Endpoint
app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (username.length < 3) {
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // Validate username format (alphanumeric and underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      message: "Username can only contain letters, numbers, and underscores",
    });
  }

  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Execute stored procedure to register user
    const request = pool.request();
    request.input("Username", sql.NVarChar(50), username);
    request.input("PasswordHash", sql.NVarChar(255), passwordHash);

    const result = await request.execute("sp_RegisterResearcher");

    const researcherId = result.recordset[0].ResearcherID;

    // Generate JWT token
    const token = jwt.sign({ researcherId, username }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "Researcher account created successfully",
      token,
      researcher: {
        id: researcherId,
        username,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);

    if (err.message.includes("Username already exists")) {
      return res.status(409).json({ message: "Username already exists" });
    }

    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // Execute stored procedure to get user
    const request = pool.request();
    request.input("Username", sql.NVarChar(50), username);

    const result = await request.execute("sp_LoginResearcher");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const researcher = result.recordset[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      researcher.PasswordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Check if account is active
    if (!researcher.IsActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    // Create session record
    const sessionRequest = pool.request();
    sessionRequest.input("ResearcherID", sql.Int, researcher.ResearcherID);
    sessionRequest.input("IPAddress", sql.NVarChar(45), req.ip);
    await sessionRequest.execute("sp_CreateSession");

    // Generate JWT token
    const token = jwt.sign(
      {
        researcherId: researcher.ResearcherID,
        username: researcher.Username,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      researcher: {
        id: researcher.ResearcherID,
        username: researcher.Username,
        lastLogin: researcher.LastLogin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// Protected Route Example - Get Current User Profile
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const request = pool.request();
    request.input("ResearcherID", sql.Int, req.user.researcherId);

    const result = await request.query(`
      SELECT 
        ResearcherID,
        Username,
        CreatedAt,
        LastLogin,
        DATEDIFF(DAY, CreatedAt, GETDATE()) AS DaysSinceRegistration
      FROM Researchers
      WHERE ResearcherID = @ResearcherID AND IsActive = 1
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Researcher not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Get Researcher Statistics (Admin/Dashboard)
app.get("/api/auth/stats", authenticateToken, async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM fn_GetResearcherStats()");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
});

// Create a new research post
app.post("/api/posts", authenticateToken, async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      message: "Title, content, and category are required",
    });
  }

  try {
    const request = pool.request();
    request.input("ResearcherID", sql.Int, req.user.researcherId);
    request.input("Title", sql.NVarChar(500), title);
    request.input("Content", sql.NVarChar(sql.MAX), content);
    request.input("Category", sql.NVarChar(50), category);
    request.input("Tags", sql.NVarChar(1000), tags ? tags.join(",") : null);

    const result = await request.execute("sp_CreateResearchPost");
    const postId = result.recordset[0].PostID;

    res.status(201).json({
      message: "Post created successfully",
      postId,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// Get all research posts
app.get("/api/posts", authenticateToken, async (req, res) => {
  try {
    const result = await pool.request().execute("sp_GetAllResearchPosts");

    // Transform data to match frontend format
    const posts = result.recordset.map((post) => {
      // Generate avatar from username (first 2 letters)
      const nameParts = post.Username.split(".");
      const avatar =
        nameParts.length > 1
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : post.Username.substring(0, 2).toUpperCase();

      return {
        id: post.PostID.toString(),
        author: {
          name: post.Username,
          title: post.ResearcherTitle || "Researcher",
          institution: post.Institution || "Research Institution",
          avatar: avatar,
          badges: ["Verified Member"],
        },
        title: post.Title,
        content: post.Content,
        tags: post.Tags ? post.Tags.split(",") : [],
        likes: post.Likes,
        comments: post.Comments,
        shares: post.Shares,
        createdAt: post.CreatedAt,
        category: post.Category,
      };
    });

    res.json(posts);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// Update post interaction (like, comment, share)
app.patch(
  "/api/posts/:postId/interact",
  authenticateToken,
  async (req, res) => {
    const { postId } = req.params;
    const { type } = req.body; // 'like', 'comment', or 'share'

    if (!["like", "comment", "share"].includes(type)) {
      return res.status(400).json({ message: "Invalid interaction type" });
    }

    try {
      const request = pool.request();
      request.input("PostID", sql.Int, parseInt(postId));
      request.input("LikesIncrement", sql.Int, type === "like" ? 1 : 0);
      request.input("CommentsIncrement", sql.Int, type === "comment" ? 1 : 0);
      request.input("SharesIncrement", sql.Int, type === "share" ? 1 : 0);

      await request.execute("sp_UpdatePostInteraction");

      res.json({ message: "Interaction recorded successfully" });
    } catch (err) {
      console.error("Update interaction error:", err);
      res.status(500).json({ message: "Failed to update interaction" });
    }
  }
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database: pool ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ExoQuest Auth API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  if (pool) {
    await pool.close();
  }
  process.exit(0);
});
