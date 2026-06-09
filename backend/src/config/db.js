const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'smartattend',
      user:     process.env.DB_USER     || 'smartattend',
      password: process.env.DB_PASSWORD || 'smartattend_secret',
    });

pool.on('error', (err) => console.error('Unexpected DB error', err));

const testConnection = async () => {
  const client = await pool.connect();
  const { rows } = await client.query('SELECT NOW()');
  client.release();
  console.log('✓ PostgreSQL connected:', rows[0].now);
};

module.exports = { pool, testConnection };