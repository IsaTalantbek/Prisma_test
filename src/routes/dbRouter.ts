import { Router } from 'express'
import fetchController from '../controllers/db/fetchController.ts'

const router = Router()

router.get('/profile', fetchController)

export default router
