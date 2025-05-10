import express from 'express';

import { getUsers } from '../controller/adminController.js';

const router = express.Router();

router.get('/',getUsers);

export default router;