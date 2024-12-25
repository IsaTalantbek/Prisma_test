import { Router } from 'express'
import { checkRole } from '../middleware/authMiddleware'
import profileController from '../controllers/profile/profileController'
import postsController from '../controllers/posts/postsController'
import adminPath from '../path/protected/adminPath'
import searchPath from '../path/protected/search'
import adminRouter from './adminRouter'

const router = Router()

// Маршрут для главной страницы
router.get('/main')
router.use('/admin', checkRole('admin'), adminRouter)
router.get('/search', (req, res) => {
    res.sendFile(searchPath)
})
router.use('/main', postsController)
router.use('/profile', profileController)

export default router
