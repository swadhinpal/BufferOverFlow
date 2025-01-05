const express = require('express');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
const { minioClient, bucketName } = require('../config/minio');

const router = express.Router();
const upload = multer();

// MongoDB connection
const mongoUri = 'mongodb://localhost:27017'; // Update with your MongoDB URI
const dbName = 'bufferOverflow'; // Update with your database name
let db;

MongoClient.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

// GET /post
router.get('/post', async (req, res) => {
  try {
    const { email } = req.query;

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await db
      .collection('content')
      .aggregate([
        { $match: { userId: { $ne: user._id } } },
        { $sort: { time: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        {
          $project: {
            text: 1,
            filename: 1,
            time: 1,
            email: '$userDetails.email',
          },
        },
      ])
      .toArray();

    const contents = await fetchContentWithCode(posts);
    res.status(200).json({ contents });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts', err });
  }
});

// Helper functions
async function fetchContentWithCode(posts) {
  return Promise.all(
    posts.map(async post => {
      if (post.filename) {
        const code = await fetchCodeFromMinIO(post.filename);
        return { ...post, code };
      }
      return { ...post, code: null };
    })
  );
}

async function fetchCodeFromMinIO(filename) {
  return new Promise((resolve, reject) => {
    minioClient.getObject(bucketName, filename, (err, dataStream) => {
      if (err) return reject(err);

      let code = '';
      dataStream.on('data', chunk => {
        code += chunk.toString();
      });
      dataStream.on('end', () => resolve(code));
      dataStream.on('error', reject);
    });
  });
}

// POST /post
router.post('/post', upload.single('file'), async (req, res) => {
  try {
    const { email, text, code, language } = JSON.parse(req.body.data);

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let filename = null;

    if (req.file) {
      filename = req.file.originalname;
      await uploadToMinIO(filename, req.file.buffer);
    } else if (code) {
      filename = generateFilename(language, user._id);
      await uploadToMinIO(filename, code);
    }

    const content = {
      userId: user._id,
      text,
      filename,
      time: new Date(),
    };

    const result = await db.collection('content').insertOne(content);
    updateNotifications(user._id, result.insertedId);
    res.status(201).json({ message: 'Content uploaded successfully', postId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading post', err });
  }
});

function generateFilename(language, userId) {
  const extensions = { C: '.c', 'C++': '.cpp', 'C#': '.cs', Java: '.java', Python: '.py', JavaScript: '.js' };
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  return `${timestamp}_${userId}${extensions[language]}`;
}

async function uploadToMinIO(filename, code) {
  return new Promise((resolve, reject) => {
    minioClient.putObject(bucketName, filename, code, code.length, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

async function updateNotifications(userId, postId) {
  try {
    const users = await db.collection('users').find({ _id: { $ne: userId } }).toArray();
    await Promise.all(
      users.map(async user => {
        const notification = await db.collection('notifications').findOne({ userId: user._id });

        const postIds = notification ? notification.postIds || [] : [];
        if (!postIds.includes(postId.toString())) {
          postIds.unshift(postId.toString());
          if (postIds.length > 10) postIds.pop();

          await db.collection('notifications').updateOne(
            { userId: user._id },
            { $set: { postIds } },
            { upsert: true }
          );
        }
      })
    );
  } catch (err) {
    console.error('Error updating notifications', err);
  }
}

module.exports = router;
