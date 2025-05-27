import express from 'express';
import {  addScore , getUserScores, getUserHighestScore} from '../controller/scoreController.js';

import { authenticateToken } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/add', authenticateToken, addScore);
router.get('/:userId', authenticateToken ,getUserScores);
router.get('/highest/:userId', authenticateToken, getUserHighestScore)

export default router;