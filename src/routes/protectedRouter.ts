import { Router } from 'express'
import path from 'path'
import { checkRole } from '../middleware/authMiddleware.ts'
import profileController from '../controllers/profile/profileController.ts'
import postsController from '../controllers/posts/postsController.ts'
import adminPath from '../path/protected/adminPath.ts'

const __dirname = path.resolve()
const router = Router()

// Маршрут для главной страницы
router.get('/main')
router.get('/admin-panel', checkRole('admin'), (req, res) => {
    res.sendFile(adminPath)
})
router.use('/main', postsController)
router.use('/profile', profileController)

export default router
