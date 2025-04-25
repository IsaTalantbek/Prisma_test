import { Router } from 'express'
import adminPath from '../path/protected/adminPath.js'
import getController from '../controllers/admin/getController.js'
import deleteController from '../controllers/admin/deleteController.js'
import putController from '../controllers/admin/putController.js'
import postController from '../controllers/admin/postController.js'

const router = Router()

router.get('/', (req, res) => {
    res.sendFile(adminPath)
})
router.get('/api', getController)
router.delete('/api', deleteController)
router.put('/api', putController)
router.post('/api', postController)

export default router
