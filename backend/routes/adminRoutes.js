import express from 'express';

import { deleteUser, getUsers } from '../controller/adminController.js';

const router = express.Router();

router.get('/',getUsers);
router.delete('/user/:user_id', deleteUser)

export default router;