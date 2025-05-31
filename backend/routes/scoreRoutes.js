import express from 'express';
import {  addScore , getUserScores, getUserHighestScore, getLeaderboardData} from '../controller/scoreController.js';

import { authenticateToken } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboardData)
router.post('/add', authenticateToken, addScore);
router.get('/:userId', authenticateToken ,getUserScores);
router.get('/highest/:userId', authenticateToken, getUserHighestScore)


export default router;