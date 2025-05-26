import express from 'express';
import {  addScore , getUserScores} from '../controller/scoreController.js';

import { authenticateToken } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/add', authenticateToken, addScore);
router.get('/:userid', authenticateToken ,getUserScores);

export default router;