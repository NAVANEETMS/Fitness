const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "public")));

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
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signin.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/register", async (req, res) => {
  console.log("Received Request Body:", req.body); // Debugging line

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

      res.redirect("/");
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
        res.redirect("/");
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
