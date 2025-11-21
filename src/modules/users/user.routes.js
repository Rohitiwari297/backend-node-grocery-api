import { Router } from 'express';
import {
    addUser,
    getUsers,
    updateUser,
    getUserById,
    getUserAddress,
    addUserAddress,
    deleteUserAddress
} from './user.controller.js';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { auth } from '../../shared/middlewares/auth.middlewares.js';

const router = Router();

router.use(auth);

router.route('/')
    .get(getUsers)
    .post(upload.single('avatar'), addUser);

router.route('/address')
    .get(getUserAddress)
    .post(addUserAddress)

router.route('/address/:addressId')
    .delete(deleteUserAddress)

router.route('/:userId')
    .get(getUserById)
    .patch(upload.single('avatar'), updateUser);

export default router;
