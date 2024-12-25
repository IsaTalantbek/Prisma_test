import { Router } from 'express'
import adminPath from '../path/protected/adminPath'
import getController from '../controllers/admin/getController'
import deleteController from '../controllers/admin/deleteController'
import putController from '../controllers/admin/putController'
import postController from '../controllers/admin/postController'

const router = Router()

router.get('/', (req, res) => {
    res.sendFile(adminPath)
})
router.get('/api', getController)
router.delete('/api', deleteController)
router.put('/api', putController)
router.post('/api', postController)

export default router
