import { Router } from 'express'
import path from 'path'
import { checkRole } from '../middleware/authMiddleware'
import profileController from '../controllers/profile/profileController'

const __dirname = path.resolve()
const router = Router()

// Маршрут для главной страницы
router.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'protected', 'main.html'))
})
router.get('/admin-panel', checkRole('admin'), (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'admin.html'))
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
