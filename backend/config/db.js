const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'ufferOverflow';

let db;

// Establish a connection to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    createCollections();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Create required collections if they don't exist
function createCollections() {
  const collections = [
    {
      name: 'users1',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password'],
          properties: {
            email: { bsonType: 'string', unique: true, description: 'must be a unique string and is required' },
            password: { bsonType: 'string', description: 'must be a string and is required' },
          },
        },
      },
    },
    {
      name: 'content',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user_id', 'text'],
          properties: {
            user_id: { bsonType: 'objectId', description: 'must be an ObjectId and is required' },
            text: { bsonType: 'string', description: 'must be a string and is required' },
            filename: { bsonType: 'string', description: 'must be a string' },
            time: { bsonType: 'date', description: 'must be a date' },
          },
        },
      },
    },
    {
      name: 'notifications',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user_id'],
          properties: {
            user_id: { bsonType: 'objectId', description: 'must be an ObjectId and is required' },
            post_ids: { bsonType: 'array', items: { bsonType: 'objectId' }, description: 'must be an array of ObjectIds' },
          },
        },
      },
    },
  ];

  collections.forEach(({ name, validator }) => {
    db.listCollections({ name })
      .next((err, collinfo) => {
        if (!collinfo) {
          db.createCollection(name, { validator })
            .then(() => console.log(`${name} collection created`))
            .catch((err) => console.error(`Error creating ${name} collection:`, err));
        } else {
          console.log(`${name} collection already exists`);
        }
      });
  });
}

module.exports = {
  getDb: () => db, // Export a function to retrieve the database instance
};
