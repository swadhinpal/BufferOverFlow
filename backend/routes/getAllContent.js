const express = require('express');
const connection = require('../config/db');
const { minioClient, bucketName } = require('../config/minio');

const router = express.Router();

router.get('/getAllContents', async (req, res) => {
  const { email } = req.query;

  const getUserIdQuery = 'SELECT id FROM users1 WHERE email = ?';
  connection.query(getUserIdQuery, [email], (err, userResult) => {
    if (err || userResult.length === 0) return res.status(500).json({ error: 'User not found or DB error', err });

    const userId = userResult[0].id;

    const query = `
      SELECT c.text, c.filename, c.time, u.email 
      FROM content c
      JOIN users1 u ON c.user_id = u.id 
      WHERE u.id != ?
      ORDER BY c.time DESC
    `;

    connection.query(query, [userId], async (err, results) => {
      if (err) return res.status(500).json({ error: 'DB query error', err });

      const contents = await fetchContentWithCode(results);
      res.status(200).json({ contents });
    });
  });
});

async function fetchContentWithCode(results) {
  return Promise.all(results.map(async (content) => {
    if (content.filename) {
      const code = await fetchCodeFromMinIO(content.filename);
      return { ...content, code };
    }
    return { ...content, code: null };
  }));
}

async function fetchCodeFromMinIO(filename) {
    return new Promise((resolve, reject) => {
      minioClient.getObject(bucketName, filename, (err, dataStream) => {
        if (err) {
          return reject(err);
        }
  
        let code = '';
        dataStream.on('data', (chunk) => {
          code += chunk.toString(); // Append the chunks of data to the code variable
        });
  
        dataStream.on('end', () => {
          resolve(code); // Resolve the promise with the full code
        });
  
        dataStream.on('error', (err) => {
          reject(err); // Reject the promise if there is an error
        });
      });
    });
  }
  

module.exports = router;
