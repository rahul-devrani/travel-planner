const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

db.getConnection((err, conn) => {
    if (err) {
        console.error("DB error:", err);
    } else {
        console.log("MySQL connected");
        conn.release();
    }
});

app.get('/', (req, res) => {
    res.redirect('/Home/index.html');
});

// signup
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "all fields needed" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword],
            (err) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({ success: false, message: "User already exist" });
                    }
                    return res.status(500).json({ success: false, message: "Database error" });
                }

                res.json({ success: true, message: "Signup success" });
            }
        );
    } catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and Password needed" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    });
});

// top destinations
app.get('/api/destinations/top', (req, res) => {
    db.query("SELECT * FROM destinations ORDER BY rating DESC LIMIT 6",
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
});

// all destinations
app.get('/api/destinations/all', (req, res) => {
    db.query("SELECT * FROM destinations",
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
});

// single destination
app.get('/api/destinations/:id', (req, res) => {
    db.query("SELECT * FROM destinations WHERE id = ?", [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) return res.status(404).json({ message: "Not found" });
            res.json(result[0]);
        });
});

// poi
app.get('/api/poi/:destId', (req, res) => {
    db.query("SELECT * FROM points_of_interest WHERE destination_id = ?",
        [req.params.destId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
});

// get reviews
app.get('/api/reviews/:destId', (req, res) => {
    db.query(`
        SELECT reviews.*, users.username 
        FROM reviews 
        JOIN users ON reviews.user_id = users.id 
        WHERE reviews.destination_id = ? 
        ORDER BY reviews.created_at DESC
    `,
        [req.params.destId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
});

// post review
app.post('/api/reviews', (req, res) => {
    const { destination_id, user_id, rating, comment } = req.body;

    if (!destination_id || !user_id || !comment) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    db.query(`
        INSERT INTO reviews (destination_id, user_id, rating, comment)
        VALUES (?, ?, ?, ?)`,
        [destination_id, user_id, rating || 0, comment],
        (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: "Review posted" });
        });
});

// delete review
app.delete('/api/reviews/:id/:userId', (req, res) => {
    db.query("DELETE FROM reviews WHERE id=? AND user_id=?",
        [req.params.id, req.params.userId],
        (err, result) => {

            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(403).json({ message: "Not allowed" });
            }

            res.json({ success: true });
        });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
