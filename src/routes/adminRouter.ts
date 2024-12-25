import { Router } from 'express'
import adminPath from '../path/protected/adminPath'
import getController from '../controllers/admin/getController'
import deleteController from '../controllers/admin/deleteController'

const router = Router()

router.get('/', (req, res) => {
    res.sendFile(adminPath)
})
router.get('/api', getController)
router.delete('/api', deleteController)

export default router
