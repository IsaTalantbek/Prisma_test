import { Router } from 'express'
import authRouter from './authRouter.ts'
import DbRouter from './dbRouter.ts'
import { authenticateToken, checkRole } from '../middleware/authMiddleware.ts'

const router = Router()

router.use('/db', authenticateToken, checkRole('admin'), DbRouter)
router.use('/auth', authRouter)

export default router
