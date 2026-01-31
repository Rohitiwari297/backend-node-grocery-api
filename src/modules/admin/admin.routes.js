import express from 'express'
import { createAdmin, loginAdmin } from './admin.controller.js';

const  router = express.Router()

router.post('/create', createAdmin)
router.post('/login', loginAdmin)

export default router;