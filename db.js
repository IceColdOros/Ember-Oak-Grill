const mysql = require('mysql2');
require('dotenv').config();

// create a connection pool instead of a single connection
// pool manages multiple connections automatically
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // from .env file
  user: process.env.DB_USER,         // from .env file
  password: process.env.DB_PASSWORD, // from .env file
  database: process.env.DB_NAME,     // from .env file
  waitForConnections: true,          // queue requests if all connections are busy
  connectionLimit: 10,               // max 10 simultaneous connections
  queueLimit: 0                      // unlimited queue size
});

// test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL database successfully!');
  connection.release(); // release connection back to pool
});

// export the promise-based version so we can use async/await in our routes
module.exports = pool.promise();