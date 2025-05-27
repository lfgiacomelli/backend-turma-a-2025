import { Pool } from 'pg';

const pool = new Pool({
  user: 'smithgg415',
  host: 'dpg-d0kgkoruibrs739hd8f0-a.oregon-postgres.render.com',
  database: 'zoomx_tcc',
  password: 'Jtn5fpob64g18cD9hlsZ6cXHPtoK6jTd',
  port: 5432,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export default pool;
