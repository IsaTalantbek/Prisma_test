import { Router } from 'express'
import createPostPath from '../path/posts/createPath'
import createPostController from '../controllers/posts/createPostController'
import dislikePostController from '../controllers/posts/dislikePostController'
import likePostController from '../controllers/posts/likePostContoller'
import deletePostController from '../controllers/posts/deletePostController'
import postsController from '../controllers/posts/postsController'
import userPostsController from '../controllers/posts/userPostsController'

const router = Router()

router.get('/', postsController)

router.delete('/:id/delete', deletePostController)

router.post('/:id/like', likePostController)

router.post('/:id/dislike', dislikePostController)

router.get('/:id/posts', userPostsController)

router.get('/create', async (req: any, res: any) => {
    res.sendFile(createPostPath)
})

router.post('/createPost', createPostController)

export default router
