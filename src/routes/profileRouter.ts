import { Router } from 'express'
import userProfileController from '../controllers/profile/userProfileController'
import userLoginProfileController from '../controllers/profile/userLoginProfileController'
import profileController from '../controllers/profile/profileController'
import profileUpdateController from '../controllers/profile/profileUpdateController'

const router = Router()

router.get('/:id', userProfileController)

router.get('/s/:login', userLoginProfileController)

router.get('/', profileController)

router.post('/update', profileUpdateController)

export default router
