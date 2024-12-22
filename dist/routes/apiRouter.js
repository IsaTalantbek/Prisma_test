import { Router } from 'express'
import authRouter from './authRouter.js'
import DbRouter from './dbRouter.js'
import { authenticateToken, checkRole } from '../middleware/authMiddleware'
const router = Router()
router.use('/db', authenticateToken, checkRole('admin'), DbRouter)
router.use('/auth', authRouter)
export default router
