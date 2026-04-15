const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'speaks_app';

let pool;

function createPool() {
  return mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  });
}

function query(sql, params, callback) {
  if (!pool) {
    const error = new Error('Database pool is not initialized yet.');
    if (typeof callback === 'function') {
      callback(error);
      return;
    }
    throw error;
  }

  return pool.query(sql, params, callback);
}

function getConnection(callback) {
  if (!pool) {
    const error = new Error('Database pool is not initialized yet.');
    callback(error);
    return;
  }

  pool.getConnection(callback);
}

async function initializeDatabase() {
  const bootstrapConnection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    multipleStatements: true,
  });

  const bootstrapQuery = (sql) => new Promise((resolve, reject) => {
    bootstrapConnection.query(sql, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });

  try {
    await bootstrapQuery(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  } finally {
    bootstrapConnection.end();
  }

  pool = createPool();

  const schemaPath = path.join(__dirname, 'speaks_app.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8').trim();
    if (schemaSql) {
      await new Promise((resolve, reject) => {
        pool.query(schemaSql, (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  }

  await new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return;
      }

      console.log(`Connected to MySQL database: ${DB_NAME}`);
      connection.release();
      resolve();
    });
  });
}

module.exports = {
  query,
  getConnection,
  initializeDatabase,
};
