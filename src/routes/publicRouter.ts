import { Router } from 'express'
import refreshController from '../controllers/auth/refreshController.js'
import regPath from '../path/public/regPath.js'
import loginPath from '../path/public/loginPath.js'
import { redirectIfAuthenticated } from '../middleware/authMiddleware.js'

const router = Router()

// Маршрут для главной страницы
router.get('/reg', redirectIfAuthenticated, (req, res) => {
    res.sendFile(regPath)
})
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.sendFile(loginPath)
})
router.get('/refresh-auth', refreshController)

export default router
