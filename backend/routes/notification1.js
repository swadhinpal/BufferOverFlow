// backend/routes/notification.js
const express = require('express');
const connection = require('../config/db1');
const { minioClient, bucketName } = require('../config/minio'); // Import MinIO client config


const router = express.Router();

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

      if (notificationResults.length === 0 || !notificationResults[0].post_ids) {
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


// Run this function every 2 minutes (120000 ms)
/*function runCleanNotifications() {
  console.log('Running runNotifications...');
  const cleanOldNotificationsQuery = `
    SELECT user_id, post_ids
    FROM notifications
  `;

  connection.query(cleanOldNotificationsQuery, (err, notifications) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return;
    }

    notifications.forEach(notification => {
      const userId = notification.user_id;
      const postIdsString = notification.post_ids;

      // Check if post_ids is null or empty and handle accordingly
      const postIdsArray = postIdsString && postIdsString.length > 0 
        ? postIdsString.split(',').map(id => id.trim()).filter(Boolean) 
        : [];

      // If there are post IDs to clean, perform the cleanup
      if (postIdsArray.length > 0) {
        cleanOldNotifications(userId, postIdsArray)
          .then(updatedPostIdsArray => {
            if (updatedPostIdsArray.length === 0) {
              // If no post IDs are left, remove the entry
              const removeNotificationsQuery = `
                UPDATE notifications
                SET post_ids = NULL
                WHERE user_id = ?
              `;
              connection.query(removeNotificationsQuery, [userId], (err, result) => {
                if (err) {
                  console.error(`Error removing notifications for user ${userId}:`, err);
                } else {
                  console.log(`Removed all notifications for user ${userId}`);
                }
              });
            } else {
              // If some post IDs are left, update the post_ids field
              const updatedPostIdsString = updatedPostIdsArray.join(',');
              const updateNotificationsQuery = `
                UPDATE notifications
                SET post_ids = ?
                WHERE user_id = ?
              `;
              connection.query(updateNotificationsQuery, [updatedPostIdsString, userId], (err, result) => {
                if (err) {
                  console.error(`Error updating notifications for user ${userId}:`, err);
                } else {
                  console.log(`Updated notifications for user ${userId}`);
                }
              });
            }
          })
          .catch(err => {
            console.error(`Failed to clean notifications for user ${userId}:`, err);
          });
      } else {
        console.log(`No post_ids found for user ${userId}. Skipping cleanup.`);
      }
    });
  });
}

// Run the function immediately
runCleanNotifications();

// Set interval to run the cleanup every 2 minutes (120000 ms)
setInterval(runCleanNotifications, 120000); // 120000 ms = 2 minutes

// Function to clean old notifications (older than 10 minutes)
function cleanOldNotifications(userId, postIdsArray) {
  console.log('Running cleanOldNotifications...');
  return new Promise((resolve, reject) => {
    const currentTime = new Date().getTime();

    // Query to fetch posts based on post IDs
    const getPostsQuery = `
      SELECT c.id, c.time
      FROM content c
      WHERE c.id IN (${connection.escape(postIdsArray)})
    `;

    connection.query(getPostsQuery, (err, posts) => {
      if (err) {
        return reject(err);
      }

      // Filter out posts older than 10 minutes
      const updatedPostIdsArray = postIdsArray.filter(postId => {
        const post = posts.find(p => p.id == postId);
        if (post) {
          const postTime = new Date(post.time).getTime();
          return currentTime - postTime <= 120000; // 10 minutes = 600000 ms
        }
        return false;
      });

      resolve(updatedPostIdsArray);
    });
  });
}*/


router.post('/notification', async (req, res) => {
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
