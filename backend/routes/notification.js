// backend/routes/notification.js
const express = require('express');
const connection = require('../config/db');

const router = express.Router();

// Fetch notifications for the user
router.get('/notification', async (req, res) => {
  const { email } = req.query;

  // Get user ID based on email
  const getUserIdQuery = 'SELECT id FROM users1 WHERE email = ?';
  connection.query(getUserIdQuery, [email], (err, userResult) => {
    if (err || userResult.length === 0) 
      return res.status(500).json({ error: 'User not found or DB error', err });

    const userId = userResult[0].id;

    // Fetch post IDs from notifications as a comma-separated string
    const getPostIdsQuery = 'SELECT post_ids FROM notifications WHERE user_id = ?';
    connection.query(getPostIdsQuery, [userId], (err, notificationResults) => {
      if (err) return res.status(500).json({ error: 'DB query error', err });

      if (notificationResults.length === 0) {
        return res.status(200).json({ notifications: [] }); // No notifications found
      }

      const postIdsString = notificationResults[0].post_ids; // Assuming it's the first row
      const postIdsArray = postIdsString.split(',').map(id => id.trim()).filter(Boolean); // Split and trim

      // Check if postIdsArray is empty
      if (postIdsArray.length === 0) {
        return res.status(200).json({ notifications: [] }); // No post IDs to query
      }

      // Retrieve email for each post ID
      const notifications = [];
      const getEmailQuery = `SELECT c.id, u.email FROM content c JOIN users1 u ON c.user_id = u.id WHERE c.id IN (${connection.escape(postIdsArray)})`;
      connection.query(getEmailQuery, (err, results) => {
        if (err) return res.status(500).json({ error: 'DB query error', err });

        results.forEach(result => {
          notifications.push({ email: result.email, postId: result.id });
        });

        res.status(200).json({ notifications });
      });
    });
  });
});


module.exports = router;
