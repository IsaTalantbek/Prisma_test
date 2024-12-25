import { Router } from 'express'
import path from 'path'
import refreshController from '../controllers/auth/refreshController.ts'
import regPath from '../path/public/regPath.ts'
import loginPath from '../path/public/loginPath.ts'
import { redirectIfAuthenticated } from '../middleware/authMiddleware.ts'

const __dirname = path.resolve()
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
