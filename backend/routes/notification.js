const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { minioClient, bucketName } = require('../config/minio'); // Import MinIO client config

const router = express.Router();

// MongoDB configuration
const mongoUri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const dbName = 'bufferOverflow'; // Replace with your database name

// MongoDB client
let dbClient = null;
async function getDB() {
  if (!dbClient) {
    dbClient = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await dbClient.connect();
  }
  return dbClient.db(dbName);
}

router.get('/notification', async (req, res) => {
  const { email } = req.query;

  try {
    const db = await getDB();

    // Get user ID based on email
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userId = user._id;
    console.log("users");
    console.log(user._id);
    // Fetch post IDs from notifications
    const notification = await db.collection('notifications').findOne({ userId });
    if (!notification || !notification.postIds || notification.postIds.length === 0) {
      return res.status(200).json({ notifications: [] }); // No notifications found
    }

    const postIdsArray = notification.postIds;
    console.log("postIdsArray");
    console.log(postIdsArray);

    // Retrieve email for each post ID
    const posts = await db.collection('content')
      .aggregate([
        { $match: { _id: { $in: postIdsArray.map(id => new ObjectId(id)) } } },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { id: '$_id', email: '$user.email' } }
      ])
      .toArray();

    console.log("posts");
    console.log(posts);

    const notifications = posts.map(post => ({
      email: post.email,
      postId: post.id
    }));

    console.log("notifications");
    console.log(notifications);

    res.status(200).json({ notifications });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Run this function every 2 minutes (120000 ms)
async function runCleanNotifications() {
  console.log('Running runCleanNotifications...');
  try {
    const db = await getDB();

    const notifications = await db.collection('notifications').find().toArray();
    const currentTime = new Date().getTime();

    for (const notification of notifications) {
      const postIdsArray = notification.postIds || [];

      if (postIdsArray.length > 0) {
        const posts = await db.collection('content')
          .find({ _id: { $in: postIdsArray.map(id => new ObjectId(id)) } })
          .toArray();

        const updatedPostIdsArray = postIdsArray.filter(postId => {
          const post = posts.find(p => p._id.toString() === postId);
          if (post) {
            const postTime = new Date(post.time).getTime();
            return currentTime - postTime <= 600000; // 10 minutes
          }
          return false;
        });

        if (updatedPostIdsArray.length === 0) {
          await db.collection('notifications').deleteOne({ _id: notification._id });
          console.log(`Removed all notifications for user ${notification.userId}`);
        } else {
          await db.collection('notifications').updateOne(
            { _id: notification._id },
            { $set: { postIds: updatedPostIdsArray } }
          );
          console.log(`Updated notifications for user ${notification.userId}`);
        }
      } else {
        console.log(`No postIds found for user ${notification.userId}. Skipping cleanup.`);
      }
    }
  } catch (err) {
    console.error('Error cleaning notifications:', err);
  }
}

// Run the function immediately
runCleanNotifications();

// Set interval to run the cleanup every 2 minutes (120000 ms)
setInterval(runCleanNotifications, 120000); // 120000 ms = 2 minutes

router.post('/notification', async (req, res) => {
  const { email, postId } = req.body;

  try {
    const db = await getDB();

    // Get user ID based on email
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userId = user._id;

    // Fetch post content based on post ID
    const post = await db.collection('content')
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' }
      ])
      .next();

      console.log("wtf");
      console.log(post);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    let code = null;

    // If filename exists, retrieve the code from MinIO
    if (post.filename) {
      code = await fetchCodeFromMinIO(post.filename);
    }

    // Remove the clicked post ID from notifications
    const notification = await db.collection('notifications').findOne({ userId });
    const updatedPostIdsArray = (notification?.postIds || []).filter(id => id !== postId);
    await db.collection('notifications').updateOne(
      { userId },
      { $set: { postIds: updatedPostIdsArray } }
    );

    res.status(200).json({ content: post, code });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
