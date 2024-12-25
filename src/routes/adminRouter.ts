import { Router } from 'express'
import adminPath from '../path/protected/adminPath'
import getController from '../controllers/admin/getController'

const router = Router()

router.get('/', (req, res) => {
    res.sendFile(adminPath)
})
router.get('/api', getController)

export default router
