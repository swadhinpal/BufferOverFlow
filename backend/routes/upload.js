const express = require('express'); 
const multer = require('multer'); // Import multer for handling file uploads
const { minioClient, bucketName } = require('../config/minio');
const connection = require('../config/db');

const router = express.Router();
const upload = multer(); // Create multer instance
/*router.post('/upload', (req, res) => {
  const { email, text, code, language } = req.body;

  const query = 'SELECT id FROM users1 WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB query error', err });

    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const userId = results[0].id;
    const filename = code ? generateFilename(language, userId) : null;

    if (filename) {
      uploadToMinIO(filename, code, (uploadError) => {
        if (uploadError) return res.status(500).json({ error: 'MinIO upload error', uploadError });
        insertContentToDatabase(userId, text, filename, res);
      });
    } else {
      insertContentToDatabase(userId, text, null, res);
    }
  });
});

router.post('/upload', upload.single('file'), (req, res) => {
    const { email, text, code, language } = JSON.parse(req.body.data); // Parse the uploaded data
  
    const query = 'SELECT id FROM users1 WHERE email = ?';
    connection.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'DB query error', err });
  
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
  
      const userId = results[0].id;
      let filename = null;
  
      if (req.file) {
        filename = req.file.originalname; // Get the original filename
        // Save file to MinIO
        uploadToMinIO(filename, req.file.buffer, (uploadError) => {
          if (uploadError) return res.status(500).json({ error: 'MinIO upload error', uploadError });
          insertContentToDatabase(userId, text, filename, res);
        });
      } else if (code) {
        filename = generateFilename(language, userId);
        uploadToMinIO(filename, code, (uploadError) => {
          if (uploadError) return res.status(500).json({ error: 'MinIO upload error', uploadError });
          insertContentToDatabase(userId, text, filename, res);
        });
      } else {
        insertContentToDatabase(userId, text, null, res);
      }
    });
  });*/
  router.post('/upload', upload.single('file'), (req, res) => {
    const { email, text, code, language } = JSON.parse(req.body.data); // Parse the uploaded data
  
    const query = 'SELECT id FROM users1 WHERE email = ?';
    connection.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ error: 'DB query error', err });
  
      if (results.length === 0) return res.status(404).json({ error: 'User not found' });
  
      const userId = results[0].id;
      let filename = null;
  
      if (req.file) {
        filename = req.file.originalname; // Get the original filename
        // Save file to MinIO
        uploadToMinIO(filename, req.file.buffer, (uploadError) => {
          if (uploadError) return res.status(500).json({ error: 'MinIO upload error', uploadError });
          insertContentToDatabase(userId, text, filename, res);
        });
      } else if (code) {
        filename = generateFilename(language, userId);
        uploadToMinIO(filename, code, (uploadError) => {
          if (uploadError) return res.status(500).json({ error: 'MinIO upload error', uploadError });
          insertContentToDatabase(userId, text, filename, res);
        });
      } else {
        insertContentToDatabase(userId, text, null, res);
      }
    });
  });
  
  function insertContentToDatabase(userId, text, filename, res) {
    const insertQuery = 'INSERT INTO content (user_id, text, filename) VALUES (?, ?, ?)';
    connection.query(insertQuery, [userId, text, filename], (err, result) => {
      if (err) return res.status(500).json({ error: 'DB insert error', err });
  
      const postId = result.insertId; // Get the newly created post ID
      updateNotifications(userId, postId); // Update notifications for all users
      res.status(201).json({ message: 'Content uploaded successfully', postId });
    });
  }
  
  function updateNotifications(userId, postId) {
    console.log("inside notification");
  
    // Query to get notifications for all users except the creator
    const query = 'SELECT * FROM notifications WHERE user_id != ?';
    connection.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching notifications:', err);
        return; // Exit the function on error
      }
  
      results.forEach(row => {
        // Split post_ids into an array, or initialize as an empty array if NULL
        const currentPostIds = row.post_ids ? row.post_ids.split(',') : [];
  
        // Check if the new postId is already present
        if (!currentPostIds.includes(postId.toString())) {
          currentPostIds.unshift(postId.toString()); // Add the new postId to the front of the array
  
          // Keep only the latest 10 notifications (for example)
          if (currentPostIds.length > 10) currentPostIds.pop(); // Remove the oldest notification if exceeding limit
  
          const updatedPostIds = currentPostIds.join(','); // Convert back to a comma-separated string
  
          // Update the notifications table for each user
          const updateQuery = 'UPDATE notifications SET post_ids = ? WHERE user_id = ?';
          connection.query(updateQuery, [updatedPostIds, row.user_id], (updateErr) => {
            if (updateErr) {
              console.error('Error updating notifications:', updateErr);
            } else {
              console.log(`Notifications updated for user ID ${row.user_id}`);
            }
          });
        }
      });
    });
  }
  
  

function generateFilename(language, userId) {
  const extensions = { C: '.c', 'C++': '.cpp', 'C#': '.cs', Java: '.java', Python: '.py', JavaScript: '.js' };
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  return `${timestamp}_${userId}${extensions[language]}`;
}

function uploadToMinIO(filename, code, callback) {
  minioClient.putObject(bucketName, filename, code, code.length, callback);
}

/*function insertContentToDatabase(userId, text, filename, res) {
  const query = 'INSERT INTO content (user_id, text, filename, time) VALUES (?, ?, ?, NOW())';
  connection.query(query, [userId, text, filename], (err) => {
    if (err) return res.status(500).json({ error: 'DB insert error', err });
    res.status(200).json({ message: 'Content stored successfully' });
  });
}*/

module.exports = router;
