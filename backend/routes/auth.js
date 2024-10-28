const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../config/db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register new user
/*router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users1 (email, password) VALUES (?, ?)';
  connection.query(query, [email, hashedPassword], (err) => {
    if (err) return res.status(500).json({ error: 'User registration failed', err });
    res.status(200).json({ message: 'User registered successfully' });
  });
});*/
// routes/auth.js (or wherever your register route is defined)

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = 'SELECT * FROM users1 WHERE email = ?';
  connection.query(checkEmailQuery, [email], async (checkErr, results) => {
    if (checkErr) {
      return res.status(500).json({ error: 'Database query error', err: checkErr });
    }

    // If user exists, return an error message
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // If user does not exist, proceed to register
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = 'INSERT INTO users1 (email, password) VALUES (?, ?)';
    connection.query(insertUserQuery, [email, hashedPassword], (insertErr, insertResults) => {
      if (insertErr) {
        return res.status(500).json({ error: 'User registration failed', err: insertErr });
      }

      const userId = insertResults.insertId; // Get the ID of the newly registered user

      // Insert into the notifications table for the newly registered user
      const notificationQuery = 'INSERT INTO notifications (user_id) VALUES (?)';
      connection.query(notificationQuery, [userId], (notificationErr) => {
        if (notificationErr) {
          return res.status(500).json({ error: 'Failed to create notification entry', notificationErr });
        }

        res.status(200).json({ message: 'User registered successfully' });
      });
    });
  });
});

  
// User login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users1 WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  });
});

// Verify JWT token middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = { router, authenticateToken };
