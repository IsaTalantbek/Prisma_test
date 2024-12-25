import { Router } from 'express';
import loginController from '../controllers/auth/loginController.js';
import regController from '../controllers/auth/regController.js';
const router = Router();
router.post('/login', loginController);
router.post('/reg', regController);
export default router;
