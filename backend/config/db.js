const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  createTables();
});

// Create required tables if they don't exist
function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users1 (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `;

  const contentTable = `
    CREATE TABLE IF NOT EXISTS content (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      text TEXT,
      filename VARCHAR(255),
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users1(id) ON DELETE CASCADE
    );
  `;

  const notificationTable = `
  CREATE TABLE IF NOT EXISTS notifications (
    user_id INT,
    post_ids VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users1(id) ON DELETE CASCADE
  );
`;

connection.query(notificationTable, (err) => {
  if (err) console.error('Error creating notifications table:', err);
  else console.log('Notifications table ready');
});
  connection.query(usersTable, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('Users table ready');
  });

  connection.query(contentTable, (err) => {
    if (err) console.error('Error creating content table:', err);
    else console.log('Content table ready');
  });
}

module.exports = connection;
