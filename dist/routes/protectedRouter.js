import { Router } from 'express'
import path from 'path'
import { checkRole } from '../middleware/authMiddleware.js'
import profileController from '../controllers/profile/profileController.js'
const __dirname = path.resolve()
const router = Router()
// Маршрут для главной страницы
router.get('/main', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'dist', 'views', 'protected', 'main.html')
    )
})
router.get('/admin-panel', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'views', 'admin.html'))
})
router.use(
    '/profile',
    (req, res, next) => {
        console.log('hello')
        next()
    },
    profileController
)
export default router
