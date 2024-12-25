import { Router } from 'express'
import loginController from '../controllers/auth/loginController'
import regController from '../controllers/auth/regController'

const router = Router()

router.post('/login', loginController)
router.post('/reg', regController)

export default router
