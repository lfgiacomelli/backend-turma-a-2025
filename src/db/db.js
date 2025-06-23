import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();


const pool = new Pool({
  user: process.env.USER_DB,
  host: process.env.HOST_DB,
  database: process.env.DATABASE,
  password: process.env.PASSWORD, 
  port: 5432,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export default pool;
