import express from 'express';
import { register, login, validateToken , logout } from '../controller/authController.js';
import { authenticateToken } from '../middleware/authMiddleWare.js';
const router = express.Router()


router.post('/register',register);
router.post('/login', login);
router.post('/validate', authenticateToken ,validateToken)
router.post('/logout', authenticateToken, logout)

export default router;