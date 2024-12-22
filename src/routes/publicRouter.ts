import { Router } from 'express'
import path from 'path'
import refreshController from '../controllers/auth/refreshController'

const __dirname = path.resolve()
const router = Router()

// Маршрут для главной страницы
router.get('/reg', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'reg.html'))
})
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'login.html'))
})
router.get('/refresh-auth', refreshController)

export default router
