import { PrismaClient } from '@prisma/client'
import { Mutex } from 'async-mutex'

const prisma = new PrismaClient()

// Map для хранения мьютексов на каждый пост
const postLocks = new Map<number, Mutex>()

const getUserMutex = (userId: number) => {
    if (!postLocks.has(userId)) {
        postLocks.set(userId, new Mutex())
    }
    return postLocks.get(userId)!
}

const dislikeService = async (postId: number, userId: number) => {
    const mutex = getUserMutex(userId) // Получаем мьютекс для конкретного поста
    const release = await mutex.acquire()

    try {
        const result = await prisma.$transaction(async (prisma) => {
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo || !postWithInfo.info) {
                return { message: 'Post not found or missing info' }
            }

            const existingDislike = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: 'dislike' },
                },
            })

            // Если дизлайк уже существует
            if (existingDislike) {
                return { message: 'Already disliked' }
            }

            const existingLike = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: 'like' },
                },
            })

            let updatedPost
            let updatedInfo

            if (existingLike) {
                await prisma.like.update({
                    where: { id: existingLike.id },
                    data: { type: 'dislike' },
                })

                // Обновляем счётчики
                updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { decrement: 1 },
                        dislikes: { increment: 1 },
                    },
                })

                updatedInfo = await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: {
                        likes: { decrement: 1 },
                        dislikes: { increment: 1 },
                    },
                })

                return {
                    message: 'like-switched-to-dislike',
                    post: updatedPost,
                }
            }

            // Новый дизлайк
            await prisma.like.create({
                data: { userId, postId, type: 'dislike' },
            })

            // Обновляем счётчики
            updatedPost = await prisma.post.update({
                where: { id: postId },
                data: {
                    dislikes: { increment: 1 },
                },
            })

            updatedInfo = await prisma.info.update({
                where: { id: postWithInfo.info.id },
                data: {
                    dislikes: { increment: 1 },
                },
            })

            return { message: 'dislike-added', post: updatedPost }
        })

        return result
    } finally {
        release() // Освобождаем мьютекс для данного поста
    }
}

export default dislikeService
