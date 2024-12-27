const express = require('express');
const bcrypt = require('bcrypt');
const connection = require('../config/db');

const router = express.Router();


router.post('/signup', async (req, res) => {
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

module.exports = router;
