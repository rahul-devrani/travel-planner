const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// static folder
app.use(express.static(path.join(__dirname, 'Public')));


require('dotenv').config();

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: process.env.DB_PORT
// });


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'tour'
});


db.connect(err => {
    if (err) {
        console.error("MySQL failed:", err);
    } else {
        console.log("MySQL Connected");
    }
});


// db.connect(err => {
//     if (err) {
//         console.error(" MySQL failed", err.message);
//     } else {
//         console.log("MySQL connected");
//     }
// });



app.get('/', (req, res) => {
    res.redirect('/Home/index.html');
});




// signup
app.post('/api/signup', async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "all fields needed"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        db.query(sql, [username, email, hashedPassword], (err, result) => {

            if (err) {
                console.error(err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        success: false,
                        message: "User already exist"
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            res.json({
                success: true,
                message: "Signup success"
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error during signup"
        });
    }
});


// login
app.post('/api/login', (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password needed"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
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




// top 6
app.get('/api/destinations/top', (req, res) => {
    const sql = "SELECT * FROM destinations ORDER BY rating DESC LIMIT 6";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// all
app.get('/api/destinations/all', (req, res) => {
    const sql = "SELECT * FROM destinations";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// single
app.get('/api/destinations/:id', (req, res) => {
    const sql = "SELECT * FROM destinations WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
            return res.status(404).json({ message: "Destination not found" });
        }

        res.json(result[0]);
    });
});


// poi 

app.get('/api/poi/:destId', (req, res) => {

    const sql = "SELECT * FROM points_of_interest WHERE destination_id = ?";

    db.query(sql, [req.params.destId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});




// get reviews
app.get('/api/reviews/:destId', (req, res) => {

    const sql = `
        SELECT reviews.*, users.username 
        FROM reviews 
        JOIN users ON reviews.user_id = users.id 
        WHERE reviews.destination_id = ? 
        ORDER BY reviews.created_at DESC
    `;

    db.query(sql, [req.params.destId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// post review
app.post('/api/reviews', (req, res) => {

    const { destination_id, user_id, rating, comment } = req.body;

    if (!destination_id || !user_id || !comment) {
        return res.status(400).json({
            success: false,
            message: "Missing fields"
        });
    }

    const sql = `
        INSERT INTO reviews (destination_id, user_id, rating, comment) 
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [destination_id, user_id, rating || 0, comment], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Review posted successfully"
        });
    });
});

app.delete('/api/reviews/:id/:userId', (req, res) => {

    const { id, userId } = req.params;

    const sql = "DELETE FROM reviews WHERE id=? AND user_id=?";

    db.query(sql, [id, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "Not allowed" });
        }

        res.json({ success: true });
    });
});

// server 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("\nServer is in ");
    console.log(`http://localhost:${PORT}`);
});