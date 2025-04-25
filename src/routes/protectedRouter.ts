import { Router } from 'express'
import { checkRole } from '../middleware/authMiddleware.js'
import searchPath from '../path/protected/search.js'
import adminRouter from './adminRouter.js'
import profileRouter from './profileRouter.js'
import postsRouter from './postsRouter.js'

const router = Router()

router.use('/admin', checkRole('admin'), adminRouter)
router.get('/search', (req, res) => {
    res.sendFile(searchPath)
})
router.use('/main', postsRouter)
router.use('/profile', profileRouter)

export default router
