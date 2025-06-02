import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import https from 'https'
import fs from 'fs'


import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';

// access environmetal variables from .env
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000


app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

app.use(cookieParser())
app.use(express.json()) // required to parse json 

// Load mkcert-generated cert and key
const key = fs.readFileSync('./localhost-key.pem');
const cert = fs.readFileSync('./localhost.pem');

// admin routes
app.use('/admin', adminRoutes);

// auth routes
app.use('/', authRoutes);

// score and profile routes
app.use('/score',scoreRoutes);


app.get('/', (req, res) => {
    res.send("Hello, Node.js!");
});

// app.listen(PORT, () =>{
//     console.log(`Server is running on http://localhost:${PORT}`);
// })

// Start HTTPS server
https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`✅ HTTPS server is running at https://localhost:${PORT}`);
});