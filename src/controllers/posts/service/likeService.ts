import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const likeService = async (postId: number, userId: number) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo || !postWithInfo.info) {
                return { message: 'Post not found or missing info' }
            }

            // Проверка на существующий лайк/дизлайк
            const likeCheck = await prisma.like.findUnique({
                where: { userId_postId_type: { userId, postId, type: 'like' } },
            })

            if (likeCheck) {
                return { message: 'Already liked' }
            }

            // Проверка на дизлайк
            const dislikeCheck = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: 'dislike' },
                },
            })

            if (dislikeCheck) {
                // Обработка смены с дизлайка на лайк
                await prisma.like.update({
                    where: { id: dislikeCheck.id },
                    data: { type: 'like' },
                })

                const updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { increment: 1 },
                        dislikes: { decrement: 1 },
                    },
                })

                await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: {
                        likes: { increment: 1 },
                        dislikes: { decrement: 1 },
                    },
                })

                return {
                    message: 'like-added',
                    post: updatedPost,
                }
            }

            // Новый лайк
            await prisma.like.create({
                data: { userId, postId, type: 'like' },
            })

            const updatedPost = await prisma.post.update({
                where: { id: postId },
                data: { likes: { increment: 1 } },
            })

            await prisma.info.update({
                where: { id: postWithInfo.info.id },
                data: { likes: { increment: 1 } },
            })

            return { message: 'like-added', post: updatedPost }
        })

        return result
    } catch (error) {
        console.error('Error liking post:', error)
        throw new Error('Could not like the post')
    }
}

export default likeService
