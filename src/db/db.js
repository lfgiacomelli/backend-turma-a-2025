import { Pool } from 'pg';

const pool = new Pool({
  user: 'giacomelli_devs',
  host: 'dpg-d18bupggjchc73ep07vg-a.oregon-postgres.render.com',
  database: 'zoomx_tcc_fx7z',
  password: 'NyO6nehZ5tWBFopexVOJrpvCalF0y2ZS', 
  port: 5432,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export default pool;
