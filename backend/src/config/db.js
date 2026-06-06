const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_platform',
});

pool.getConnection()
  .then(() => console.log('✅ تم الاتصال بـ MySQL بنجاح'))
  .catch(err => console.error('❌ فشل الاتصال:', err.message));

module.exports = pool;