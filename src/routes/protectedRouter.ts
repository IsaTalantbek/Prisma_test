import { Router } from 'express'
import { checkRole } from '../middleware/authMiddleware'
import searchPath from '../path/protected/search'
import adminRouter from './adminRouter'
import profileRouter from './profileRouter'
import postsRouter from './postsRouter'

const router = Router()

router.use('/admin', checkRole('admin'), adminRouter)
router.get('/search', (req, res) => {
    res.sendFile(searchPath)
})
router.use('/main', postsRouter)
router.use('/profile', profileRouter)

export default router
