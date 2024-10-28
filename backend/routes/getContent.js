const express = require('express');
const connection = require('../config/db');
const { minioClient, bucketName } = require('../config/minio');

const router = express.Router();

router.get('/getContents', async (req, res) => {
  const { email } = req.query;

  const query = `
    SELECT c.text, c.filename, c.time, u.email 
    FROM content c
    JOIN users1 u ON c.user_id = u.id 
    WHERE u.email = ?
  `;

  connection.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'DB query error', err });

    const contents = await fetchContentWithCode(results);
    res.status(200).json({ contents });
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

module.exports = router;
