import { Router, text } from 'express'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import checkInfo from '../../check/infoCheck.ts'
import likeService from './service/likeService.ts'
import dislikeService from './service/dislikeService.ts'
import createPostPath from '../../path/posts/createPath.ts'
import createPostService from './service/createService.ts'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello-WORLD-im-from-B'

const prisma = new PrismaClient()

const router = Router()

router.get('/', (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }

    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const thisId = decoded.userId
            const posts = await prisma.post.findMany({
                include: { user: true },
            })
            return res.render('posts', {
                posts: posts,
                thisId: thisId,
            })
        })
    } catch (error: any) {
        console.error(error?.message || error)
        return res.status(500).json({ message: 'упс, неполадки!' })
    }
})

router.delete('/:id/delete', async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    const postId = parseInt(req.params.id, 10)
    console.log(postId)

    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }

    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            const thisId = decoded.userId
            const post = await prisma.post.findUnique({ where: { id: postId } })

            if (!post || post.userId !== thisId) {
                return res.status(403).send('Нет прав для удаления этого поста')
            }

            await prisma.like.deleteMany({
                where: { postId: postId },
            })

            await prisma.post.delete({ where: { id: postId } })

            await prisma.info.update({
                where: { userId: thisId },
                data: { postCount: { increment: 1 } },
            })

            // Удаляем сам пост

            return res.status(200).json({
                message: 'Пост и все связанные данные успешно удалены',
            })
        })
    } catch (error: any) {
        console.error(error?.message || error)
        return res.status(500).json({ message: 'Упс, неполадки!' })
    }
})

router.post('/:id/like', async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }
    const postId = await parseInt(req.params.id, 10)
    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const userId = decoded.userId

            const result = await likeService(postId, userId)

            if (!result) {
                return res.status(500).json({ message: 'like-error-500' })
            }
            if (
                result.message === 'like-added' ||
                result.message === 'like-changed-from-dislike-to-like'
            ) {
                return res.status(200).json({ message: 'like-added' })
            }
            return res.status(500).json({ message: result.message })
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

router.post('/:id/dislike', async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }
    const postId = await parseInt(req.params.id, 10)
    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const userId = decoded.userId

            const result = await dislikeService(postId, userId)

            if (!result) {
                return res.status(500).json({ message: 'like-error-500' })
            }
            if (
                result.message === 'dislike-added' ||
                result.message === 'dislike-changed-from-like-to-dislike'
            ) {
                return res.status(200).json({ message: 'dislike-added' })
            }
            return res.status(500).json({ message: result })
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
})

router.get('/create', async (req: any, res: any) => {
    res.sendFile(createPostPath)
})

router.post('/createPost', async (req: any, res: any) => {
    const { text } = req.body

    const token = req.cookies['aAuthToken']

    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }

    if (!text) {
        return res.status(400).json({ message: 'Ничего не пришло' })
    }
    if (!(await checkInfo(text))) {
        return res
            .status(401)
            .json({ message: 'текст должен быть не больше 250 символов' })
    }
    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const userId = decoded.userId

            const result = await createPostService(userId, text)

            if (!result) {
                return res.status(500).json({ message: 'createPost-error-500' })
            }
            if (result.message === 'createPost-create-200') {
                return res.status(200).json({ message: 'createPost-added' })
            }
            return res.status(500).json({ message: result.message, result })
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
        console.error(error)
    }
})

export default router
