// backend/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:[Gab28121982]@db.ylwyavsjujddbyuoymtg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};