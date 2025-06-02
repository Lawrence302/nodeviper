import express from 'express';
import { register, login, validateToken , logout, refreshToken } from '../controller/authController.js';
import { authenticateToken } from '../middleware/authMiddleWare.js';
const router = express.Router()


router.post('/register',register);
router.post('/login', login);
router.post('/refresh-token', refreshToken)
router.post('/validate', authenticateToken ,validateToken)
router.post('/logout', authenticateToken, logout)

export default router;