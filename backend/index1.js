const express = require('express');
const bodyParser = require('body-parser');
//const handler = require('./routes/handler.js');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Client } = require('minio');
const multer = require('multer');

//C:\minio.exe server E:\Data --console-address ":9001"
//http://localhost:9001/


let userEmail;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); // Add cors middleware

const storage = multer.memoryStorage();
const upload = multer({ storage });

const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const Minio = require('minio'); // Ensure you import Minio correctly
const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false, // Set to true if you are using SSL
    accessKey: 'admin', // Replace with your MinIO access key
    secretKey: 'password'  // Replace with your MinIO secret key
});


// Check if the bucket exists
const bucketName = 'codestore';

// List buckets
minioClient.listBuckets(function(err, buckets) {
    if (err) {
        return console.error('Error listing buckets:', err);
    }

    console.log('Buckets:', buckets.map(bucket => bucket.name));

    // Check if the desired bucket exists in the list
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists.`);
    } else {
        // Create the bucket if it doesn't exist
        minioClient.makeBucket(bucketName, '', function(err) {
            if (err) {
                return console.error('Error creating bucket:', err);
            }
            console.log(`Bucket '${bucketName}' created successfully.`);
        });
    }
});

const listBucketObjects = () => {
    minioClient.listObjects(bucketName, '', true) // true for recursive listing
        .on('data', (obj) => {
            console.log('Object:', obj); // Print each object
        })
        .on('error', (err) => {
            console.error('Error listing objects:', err);
        })
        .on('end', () => {
            console.log('Finished listing objects.');
        });
};

listBucketObjects();
 





const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1); // Exit the process if unable to connect
  }
  console.log('Connected to MySQL database');

  // Create 'authentication' database if it doesn't exist
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`;
  connection.query(createDatabaseQuery, (err, result) => {
    if (err) {
      console.error(`Error creating ${process.env.DB_NAME} database:`, err);
      process.exit(1); // Exit the process if database creation fails
    }
    console.log(`${process.env.DB_NAME} database created`);
    // After creating the database, switch to it
    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
      if (err) {
        console.error(`Error switching to ${process.env.DB_NAME} database:`, err);
        process.exit(1); // Exit the process if unable to switch databases
      }
      console.log(`Switched to ${process.env.DB_NAME} database`);

      // Create users table
      const createUserTableQuery = `
        CREATE TABLE IF NOT EXISTS users1 (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255),
          password VARCHAR(255)
        )
      `;

      connection.query(createUserTableQuery, (err, result) => {
        if (err) {
          console.error('Error creating users table:', err);
          process.exit(1); // Exit the process if table creation fails
        }
        console.log('Users1 table created');
      });

const createContentTableQuery = `
  CREATE TABLE IF NOT EXISTS content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    filename VARCHAR(255) DEFAULT NULL,
    time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users1(id)
  )
`;

// Execute the query to create the table
connection.query(createContentTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating content table:', err);
  } else {
    console.log('content table created or already exists');
  }
});

    
    });
  });
});

// Register a new user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const saltRounds = 10; // Number of salt rounds for bcrypt

  try {
    // Check if the email already exists in the database
    const checkUserQuery = `SELECT * FROM users1 WHERE email = ?`;
    connection.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        console.error('Error checking user:', err);
        res.status(500).json({ message: 'Error checking user' });
        return;
      }

      // If a user with the email already exists, return error
      if (results.length > 0) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert hashed password into the database
      const createUserQuery = `INSERT INTO users1 ( email, password) VALUES (?, ?)`;
      connection.query(createUserQuery, [ email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          res.status(500).json({ message: 'Error registering user' });
        } else {
          console.log('User registered successfully');
          res.status(200).json({ message: 'User registered successfully' });
        }
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});


// Login user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const getUserQuery = `SELECT * FROM users1 WHERE email = ?`;
  connection.query(getUserQuery, [email], async (err, result) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ message: 'Error logging in' });
    } else if (result.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
    } else {
      const user = result[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        userEmail=user.email;
        // Passwords match, generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        // Send the token in response
        console.log("Logged in and token created");
        
        res.status(200).json({ message: 'Login successful', token, email: user.email });
        //res.redirect('/input');
      } else {
        // Passwords don't match
        console.log("Invalid credential");
        res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  });
});

app.post('/upload', (req, res) => {
  const { email, text, code, language } = req.body;

  // Validate input
  if (!email || !text) {
    return res.status(400).json({ error: 'Email and text are required' });
  }

  // Query MySQL to get the user ID based on the email
  const query = 'SELECT id FROM users1 WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Database query error', details: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = results[0].id; // Get the user ID

    let filename = null; // Initialize filename to null

    // If code is provided, upload it to MinIO
    if (code && code.trim() !== '') {
      const extensionMap = {
        C: '.c',
        'C++': '.cpp',
        'C#': '.cs',
        Java: '.java',
        Python: '.py',
        JavaScript: '.js',
      };
      const fileExtension = extensionMap[language];

// Create a unique filename with timestamp
const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
const filenameWithoutExtension = `${timestamp}_${userId}`; // e.g., 20241022_150305_1

// Check if the MinIO bucket exists
minioClient.bucketExists(bucketName, (err) => {
  if (err) {
    console.error('Bucket check error:', err);
    return res.status(500).json({ error: 'Bucket does not exist', details: err });
  }

  // Upload the code to MinIO
  minioClient.putObject(
    bucketName,
    filenameWithoutExtension + fileExtension, // Use full filename with extension for upload
    code,
    code.length,
    (err, etag) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Error uploading to MinIO', details: err });
      }
      console.log(`Code uploaded successfully as ${filenameWithoutExtension + fileExtension}`);
      // Insert content with filename after successful upload
      insertContentToDatabase(userId, text, filenameWithoutExtension + fileExtension, res);
    }
  );
});
} else {
  // If no code is provided, insert content with filename as NULL
  insertContentToDatabase(userId, text, null, res);
}
});

});

// Helper function to insert data into the MySQL `content` table
function insertContentToDatabase(userId, text, filename, res) {
  const insertQuery = `
    INSERT INTO content (user_id, text, filename, time) 
    VALUES (?, ?, ?, NOW())
  `;
  connection.query(insertQuery, [userId, text, filename], (err) => {
    if (err) {
      console.error('MySQL insert error:', err);
      return res.status(500).json({ error: 'Database insert error', details: err });
    }
    res.status(200).json({ message: 'Data stored successfully' });
  });
}



app.get('/getContents', async (req, res) => {
  const email = req.query.email;

  const getContentsQuery = `
    SELECT c.text, c.filename, c.time, u.email 
    FROM content c
    JOIN users1 u ON c.user_id = u.id 
    WHERE u.email = ?
  `;

  connection.query(getContentsQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error fetching contents:', err);
      return res.status(500).json({ message: 'Error fetching contents' });
    }

    // Retrieve code from MinIO if filename is not null
    const contents = await Promise.all(results.map(async (content) => {
      if (content.filename) {
        // Fetch code from MinIO
        const code = await fetchCodeFromMinIO(content.filename);
        return {
          ...content,
          code, // Include code in the response
        };
      }
      return {
        ...content,
        code: null, // No code available
      };
    }));

    res.status(200).json({ contents });
  });
});

app.get('/getAllContents', async (req, res) => {
  const email = req.query.email;

  // First, get the user ID of the logged-in user
  const getUserIdQuery = `SELECT id FROM users1 WHERE email = ?`;
  connection.query(getUserIdQuery, [email], (err, userResult) => {
    if (err) {
      console.error('Error fetching user ID:', err);
      return res.status(500).json({ message: 'Error fetching user ID' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userResult[0].id;

    // Query to get all posts excluding the logged-in user's posts
    const getContentsQuery = `
      SELECT c.text, c.filename, c.time, u.email 
      FROM content c
      JOIN users1 u ON c.user_id = u.id 
      WHERE u.id != ? 
      ORDER BY c.time DESC
    `;

    connection.query(getContentsQuery, [userId], async (err, results) => {
      if (err) {
        console.error('Error fetching contents:', err);
        return res.status(500).json({ message: 'Error fetching contents' });
      }

      // Retrieve code from MinIO if filename is not null
      const contents = await Promise.all(results.map(async (content) => {
        if (content.filename) {
          // Fetch code from MinIO
          const code = await fetchCodeFromMinIO(content.filename);
          return {
            ...content,
            code, // Include code in the response
          };
        }
        return {
          ...content,
          code: null, // No code available
        };
      }));

      res.status(200).json({ contents });
    });
  });
});

// Function to fetch code from MinIO
async function fetchCodeFromMinIO(filename) {
  return new Promise((resolve, reject) => {
    const filePath = `${filename}`; // Adjust as necessary
    minioClient.getObject(bucketName, filePath, (err, dataStream) => {
      if (err) {
        console.error('Error fetching from MinIO:', err);
        return resolve(null); // Return null if there's an error
      }

      let code = '';
      dataStream.on('data', (chunk) => {
        code += chunk.toString(); // Append chunks to code
      });

      dataStream.on('end', () => {
        resolve(code); // Resolve the promise with the complete code
      });

      dataStream.on('error', (err) => {
        console.error('Stream error:', err);
        resolve(null); // Return null if there's a stream error
      });
    });
  });
}

