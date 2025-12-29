const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || 'ocr',
  user: process.env.DB_USERNAME || 'miniduhimal',
  password: process.env.DB_PASSWORD || '12345678',
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log(`PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    client.release();
    return pool;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = { connectDB, pool, query };
