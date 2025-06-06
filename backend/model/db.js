
import pkg from 'pg';
import dotenv from 'dotenv'

dotenv.config()

const {Pool} = pkg
// connecting to posgres db
// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT,
// });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // often needed for cloud hosted DBs
  }
});
// Test the connection

const connectdb = () => {
    pool.connect().then(client => {
        console.log('connected to database');
        client.release();
    }).catch(err => {
        console.error('Failed to connect', err.message)
    });
}

connectdb;

export default pool;