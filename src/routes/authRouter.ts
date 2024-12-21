import { Router } from 'express'
import loginController from '../controllers/auth/loginController.ts'
import regController from '../controllers/auth/regController.ts'

const router = Router()

router.post('/login', loginController)
router.post('/reg', regController)

export default router
