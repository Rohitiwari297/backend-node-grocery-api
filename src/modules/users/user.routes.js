import { Router } from 'express';
import { addUser, getUserById, getUsers, updateUser } from './user.controller.js';
import { upload } from '../../shared/middlewares/multer.middlewares.js';

const router = Router();

router.route('/').get(getUsers).post(upload.single('avatar'), addUser);

router.route('/:userId').get(getUserById).patch(upload.single('avatar'), updateUser);

export default router;
