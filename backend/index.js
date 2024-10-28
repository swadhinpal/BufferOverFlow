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

//const SSLCommerzPayment = require('sslcommerz-lts'); 
let userEmail;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); // Add cors middleware
//app.use('/', handler);
const storage = multer.memoryStorage();
const upload = multer({ storage });

const PORT = process.env.PORT || 4000;

/*const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
console.log(store_id);
console.log(store_passwd);
const is_live = false*/

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

     /* const createSubscriptionTableQuery = `
      CREATE TABLE IF NOT EXISTS subscription (
        subscription_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        transaction_id VARCHAR(255),
        amount DECIMAL(10, 2),
        subscription_plan VARCHAR(255) DEFAULT 'lifetime'
      )
    `;
    
    connection.query(createSubscriptionTableQuery, (err, result) => {
      if (err) {
        console.error('Error creating subscription table:', err);
        process.exit(1); // Exit the process if table creation fails
      }
      console.log('Subscription table created');
    });

    const createRulesTableQuery = `
    CREATE TABLE IF NOT EXISTS rules (
      rule_id VARCHAR(255) PRIMARY KEY,
      rule_name VARCHAR(255),
      level ENUM('A', 'AA', 'AAA')
    )
  `;
  
  connection.query(createRulesTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating rules table:', err);
      process.exit(1); // Exit the process if table creation fails
    }
    console.log('Rules table created');
  });

  /*const insertRulesDataQuery = `
  INSERT INTO rules (rule_id, rule_name, level) VALUES
  ('1.1.1', 'Image without alt', 'A'),
  ('1.2.2', 'Video without caption', 'A'),
  ('1.3.1', 'Table without caption', 'A'),
  ('1.4.2', 'Audio without control', 'A'),
  ('2.1.1', 'Tab index less than 0', 'A'),
  ('2.1.4', 'One char shortcut key', 'A'),
  ('2.4.1', 'No skip link', 'A'),
  ('3.2.2', 'No submit type', 'A'),
  ('3.3.2', 'Input without label', 'A'),
  ('1.3.3', 'Label without text', 'A'),
  ('4.1.2', 'Link without text or title', 'A'),
  ('2.5.2', 'Default event overridden', 'A')
`;

connection.query(insertRulesDataQuery, (err, result) => {
  if (err) {
    console.error('Error inserting data into rules table:', err);
    process.exit(1); // Exit the process if insertion fails
  }
  console.log('Data inserted into rules table');
});*/

/*const createRuleViolationsTableQuery = `
    CREATE TABLE IF NOT EXISTS rule_violations (
      violation_id VARCHAR(255),
      url VARCHAR(255) DEFAULT NULL,
      file_name VARCHAR(255) DEFAULT NULL,
      line_number INT,
      PRIMARY KEY (violation_id, url, file_name)
    )
  `;
  
  connection.query(createRuleViolationsTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating rule_violations table:', err);
      process.exit(1); // Exit the process if table creation fails
    }
    console.log('Rule Violations table created');
  });*/

  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS otp_store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expiry_time DATETIME NOT NULL,
    UNIQUE KEY email_unique (email)
  )
`;

connection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating otp_store table:', err);
  } else {
    console.log('otp_store table created or already exists');
  }
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
/*const createUrlContainerTable = `
    CREATE TABLE IF NOT EXISTS url_container (
        url_id INT AUTO_INCREMENT PRIMARY KEY,
        url_name VARCHAR(255) NOT NULL,
        violations_id INT NOT NULL,
        line_number INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

connection.query(createUrlContainerTable, (err, result) => {
    if (err) {
        console.error('Error creating url_container table:', err);
    } else {
        console.log('url_container table created successfully');
    }
});*/

    
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

        /*const getSubscriptionQuery = `SELECT * FROM subscription WHERE email = ?`;
        connection.query(getSubscriptionQuery, [email], async (err, result) => {
          if (err) {
            console.error('Error querying subscription:', err);
            res.status(500).json({ message: 'Error querying subscription' });
          } else {
            if (result.length > 0) {
              // Rows found, set your variable to true
              const subscriptionExists = true;
              console.log('Subscription found for email:', email);
              // Now you can use the subscriptionExists variable in your code
              // For example, you can send it as part of your response
              res.status(200).json({ message: 'Subscription found', subscriptionExists });
            } else {
              // No rows found, set your variable to false
              const subscriptionExists = false;
              console.log('No subscription found for email:', email);
              // Now you can use the subscriptionExists variable in your code
              // For example, you can send it as part of your response
              res.status(200).json({ message: 'No subscription found', subscriptionExists });
            }
          }
        });*/
        
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



function sendEmail()
{
  return userEmail;
}

module.exports = {sendEmail};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully');
  } catch (error) {
      console.error('Error sending OTP email:', error);
      throw error;
  }
};

// Generate a random 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Endpoint to handle forgot password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();
  const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Store OTP in database
  const insertOtpQuery = `INSERT INTO otp_store (email, otp, expiry_time) VALUES (?, ?, ?)
                          ON DUPLICATE KEY UPDATE otp = ?, expiry_time = ?`;
  connection.query(insertOtpQuery, [email, otp, expiryTime, otp, expiryTime], async (err, result) => {
      if (err) {
          console.error('Error storing OTP:', err);
          res.status(500).json({ message: 'Error storing OTP' });
      } else {
          try {
              await sendOtpEmail(email, otp);
              res.status(200).json({ message: 'OTP sent to email' });
          } catch (error) {
              res.status(500).json({ message: 'Error sending OTP email' });
          }
      }
  });
});

// Endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const getOtpQuery = `SELECT * FROM otp_store WHERE email = ? AND otp = ? AND expiry_time > NOW()`;

  connection.query(getOtpQuery, [email, otp], (err, result) => {
      if (err) {
          console.error('Error verifying OTP:', err);
          res.status(500).json({ message: 'Error verifying OTP' });
      } else if (result.length === 0) {
          res.status(401).json({ message: 'Invalid or expired OTP' });
      } else {
          res.status(200).json({ message: 'OTP verified successfully' });
      }
  });
});

// Endpoint to update password
app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const saltRounds = 10;
  try {
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const updatePasswordQuery = `UPDATE users1 SET password = ? WHERE email = ?`;
      connection.query(updatePasswordQuery, [hashedPassword, email], (err, result) => {
          if (err) {
              console.error('Error updating password:', err);
              res.status(500).json({ message: 'Error updating password' });
          } else {
              res.status(200).json({ message: 'Password updated successfully' });
          }
      });
  } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Error updating password' });
  }
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


/*
app.post('/upload', (req, res) => {
  const bucketName = 'codestore'; // Your bucket name

  // Check if the bucket exists
  minioClient.bucketExists(bucketName, (err) => {
      if (err) {
          return res.status(500).json({ error: 'Bucket does not exist', details: err });
      }

      // Destructure the request body to get email, text, and code
      const { email, text, code } = req.body;

      // Create an object containing the fields
      const uploadData = {
          email,
          text,
          code,
      };

      // Convert the object to a JSON string
      const fileContent = JSON.stringify(uploadData);

      // Create a unique object name using the current timestamp
      const objectName = `entry-${Date.now()}.json`; 

      // Upload to MinIO
      minioClient.putObject(bucketName, objectName, fileContent, fileContent.length, (err, etag) => {
          if (err) {
              console.error('Upload error:', err); // Log the error to the console
              return res.status(500).json({ error: 'Error uploading to MinIO', details: err });
          }

          // Respond with success message and etag
          res.status(200).json({ message: `Data uploaded successfully to ${bucketName}`, etag });
      });
  });
});
/*
const tran_id = uuidv4();
var emailAdd;
var amountPaid;

app.post('/pay', async (req, res) => {
  //console.log(req.body);
  const detail= req.body;
  emailAdd = detail.email;
  amountPaid= detail.amount;
  const data = {
    total_amount: detail.amount,
    currency: 'BDT',
    tran_id: tran_id, // use unique tran_id for each api call
    success_url: 'http://localhost:3000/PaymentSuccess',
    fail_url: 'http://localhost:3000/Fail',
    cancel_url: 'http://localhost:3030/cancel',
    ipn_url: 'http://localhost:3030/ipn',
    shipping_method: 'Courier',
    product_name: 'Computer.',
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Customer Name',
    cus_email: detail.email,
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
    };
    console.log(data);
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL;
    
        res.send({ url: GatewayPageURL });
      
        const subscript = {
            paymentStatus: false,
            transactionId : tran_id,
        };

        //res.redirect(`http://localhost:4000/paymentSuccess`);
        if(subscript.transactionId==req.params.transID)
          {
            //res.redirect(`http://localhost:4000/paymentSuccess/`);
          }

        console.log('Redirecting to: ', GatewayPageURL);
    });

    app.post("/PaymentSuccess", async(req, res)=>{
      //console.log(req.params.transID);
      //res.redirect("/PaymentSuccess/:transID");
      const { amount } = req.body;
      const transaction_id = tran_id;
      const email = emailAdd;

      const createSubscriptionQuery = `INSERT INTO subscription (email, amount, transaction_id) VALUES (?, ?, ?)`;
      connection.query(createSubscriptionQuery, [email, amount, transaction_id], (err, result) => {
        if (err) {
          console.error('Error inserting subscription:', err);
          res.status(500).json({ message: 'Error inserting subscription' });
        } else {
          console.log('Subscription inserted successfully');
          //res.status(200).json({ message: 'Subscription inserted successfully' });
          res.redirect("http://localhost:3000/paymentSuccess");
        }
      });
    

      //res.redirect("http://localhost:3000/paymentSuccess");
    });

    app.post("/Fail", async(req, res)=>{
      //console.log(req.params.transID);
      //res.redirect("/PaymentSuccess/:transID");
      res.redirect("http://localhost:3000/Fail");
    });
});*/
