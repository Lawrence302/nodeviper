import express from 'express';
import cors from 'cors'


import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';

// access environmetal variables from .env
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000


app.use(cors());
app.use(express.json()) // required to parse json 

// admin routes
app.use('/admin', adminRoutes);

// auth routes
app.use('/', authRoutes);

// score and profile routes
app.use('/score',scoreRoutes);


app.get('/', (req, res) => {
    res.send("Hello, Node.js!");
});

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
})