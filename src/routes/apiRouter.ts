import { Router } from 'express'
import authRouter from './authRouter'
import DbRouter from './dbRouter'
import { authenticateToken, checkRole } from '../middleware/authMiddleware'

const router = Router()

router.use('/db', authenticateToken, checkRole('admin'), DbRouter)
router.use('/auth', authRouter)

export default router
