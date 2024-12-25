import { Router } from 'express'
import fetchController from '../controllers/db/fetchController'

const router = Router()

router.get('/profile', fetchController)

export default router
