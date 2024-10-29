// backend/routes/notification.js
/*const express = require('express');
const connection = require('../config/db');
const minioClient = require('../config/minio'); // Import your MinIO client config
const bucketName = 'codestore'; // Define your bucket name

const router = express.Router();

// Handle notification click to fetch post content
router.post('/notificationClicked', async (req, res) => {
  const { email, postId } = req.body;

  // Get user ID based on email
  const getUserIdQuery = 'SELECT id FROM users1 WHERE email = ?';
  connection.query(getUserIdQuery, [email], (err, userResult) => {
    if (err || userResult.length === 0)
      return res.status(500).json({ error: 'User not found or DB error', err });

    const userId = userResult[0].id;

    // Fetch post content based on post ID
    const getPostContentQuery = `
      SELECT c.text, c.filename, c.time, u.email 
      FROM content c 
      JOIN users1 u ON c.user_id = u.id 
      WHERE c.id = ?`;

    connection.query(getPostContentQuery, [postId], async (err, contentResults) => {
      if (err) return res.status(500).json({ error: 'DB query error', err });

      if (contentResults.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const content = contentResults[0];
      let code = null;

      // If filename exists, retrieve the code from MinIO
      if (content.filename) {
        code = await fetchCodeFromMinIO(content.filename);
      }

      // Remove the clicked post ID from notifications (similar to before)
      const getPostIdsQuery = 'SELECT post_ids FROM notifications WHERE user_id = ?';
      connection.query(getPostIdsQuery, [userId], (err, notificationResults) => {
        if (err) return res.status(500).json({ error: 'DB query error', err });

        if (notificationResults.length === 0 || !notificationResults[0].post_ids) {
          return res.status(200).json({ content, code }); // No notifications found
        }

        const postIdsString = notificationResults[0].post_ids;
        const postIdsArray = postIdsString.split(',').map(id => id.trim()).filter(Boolean);
        const updatedPostIdsArray = postIdsArray.filter(id => id !== postId.toString());
        const updatedPostIdsString = updatedPostIdsArray.join(', ');

        // Update notifications
        const updateQuery = 'UPDATE notifications SET post_ids = ? WHERE user_id = ?';
        connection.query(updateQuery, [updatedPostIdsString, userId], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: 'Failed to update notifications', updateErr });
          }

          res.status(200).json({ content, code }); // Return the content and code
        });
      });
    });
  });
});

// Function to fetch code from MinIO
function fetchCodeFromMinIO(filename) {
  return new Promise((resolve, reject) => {
    let code = '';
    minioClient.getObject(bucketName, filename, (err, stream) => {
      if (err) return resolve(null);
      stream.on('data', (chunk) => (code += chunk.toString()));
      stream.on('end', () => resolve(code));
    });
  });
}

module.exports = router;*/
// backend/routes/notificationClicked.js
const express = require('express');
const connection = require('../config/db');
const { minioClient, bucketName } = require('../config/minio'); // Import MinIO client config

const router = express.Router();

// Handle notification click to fetch post content
router.post('/notificationClicked', async (req, res) => {
  const { email, postId } = req.body;

  // Get user ID based on email
  const getUserIdQuery = 'SELECT id FROM users1 WHERE email = ?';
  connection.query(getUserIdQuery, [email], (err, userResult) => {
    if (err || userResult.length === 0)
      return res.status(500).json({ error: 'User not found or DB error', err });

    const userId = userResult[0].id;

    // Fetch post content based on post ID
    const getPostContentQuery = `
      SELECT c.text, c.filename, c.time, u.email 
      FROM content c 
      JOIN users1 u ON c.user_id = u.id 
      WHERE c.id = ?`;

    connection.query(getPostContentQuery, [postId], async (err, contentResults) => {
      if (err) return res.status(500).json({ error: 'DB query error', err });

      if (contentResults.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const content = contentResults[0];
      let code = null;

      // If filename exists, retrieve the code from MinIO
      if (content.filename) {
        code = await fetchCodeFromMinIO(content.filename);
      }

      // Remove the clicked post ID from notifications (similar to before)
      const getPostIdsQuery = 'SELECT post_ids FROM notifications WHERE user_id = ?';
      connection.query(getPostIdsQuery, [userId], (err, notificationResults) => {
        if (err) return res.status(500).json({ error: 'DB query error', err });

        if (notificationResults.length === 0 || !notificationResults[0].post_ids) {
          return res.status(200).json({ content, code }); // No notifications found
        }

        const postIdsString = notificationResults[0].post_ids;
        const postIdsArray = postIdsString.split(',').map(id => id.trim()).filter(Boolean);
        const updatedPostIdsArray = postIdsArray.filter(id => id !== postId.toString());
        const updatedPostIdsString = updatedPostIdsArray.join(', ');

        // Update notifications
        const updateQuery = 'UPDATE notifications SET post_ids = ? WHERE user_id = ?';
        connection.query(updateQuery, [updatedPostIdsString, userId], (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: 'Failed to update notifications', updateErr });
          }

          res.status(200).json({ content, code }); // Return the content and code
        });
      });
    });
  });
});

// Function to fetch code from MinIO
function fetchCodeFromMinIO(filename) {
  return new Promise((resolve, reject) => {
    let code = '';
    minioClient.getObject(bucketName, filename, (err, stream) => {
      if (err) {
        console.error('Error fetching from MinIO:', err); // Log the error for debugging
        return resolve(null); // Resolve with null in case of an error
      }
      
      stream.on('data', (chunk) => (code += chunk.toString()));
      stream.on('end', () => resolve(code));
      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr); // Handle stream errors
        resolve(null); // Resolve with null in case of stream error
      });
    });
  });
}

module.exports = router;

