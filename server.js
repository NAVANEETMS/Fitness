const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure your .ejs files are inside a 'views' folder
app.use(express.static(path.join(__dirname, "public"))); // For static assets like CSS/JS

// PostgreSQL Connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "fitness",
    password: "navaneet",
    port: 5432,
});

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs",{a:"Sign in",b:"/signin"}); // Render the EJS file, not sendFile
});

app.get("/signin", (req, res) => {
    res.render("signin.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});
app.get("/join", (req, res) => {
    res.render("join.ejs");
});

// Register User
app.post("/register", async (req, res) => {
  console.log("Received Request Body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).send("Email and password are required.");
  }

  try {
      const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

      if (userExists.rows.length > 0) {
          return res.status(400).send("User already exists.");
      }

      await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, password]);
      console.log("New User Registered:", { email });

      res.render("index.ejs",{a:"Join now",b:"/join"});
  } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).send("Server error.");
  }
});

// Login User
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);

        if (user.rows.length === 0) {
            return res.status(401).send("Invalid email or password.");
        }

        console.log("User Logged In:", { email });
        res.render("index.ejs",{a:"Join now",b:"/join"});
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send("Server error.");
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
