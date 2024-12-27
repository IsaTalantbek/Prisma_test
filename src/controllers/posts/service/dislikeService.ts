import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dislikeService = async (postId: number, userId: number) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo || !postWithInfo.info) {
                return { message: 'Post not found or missing info' }
            }

            // Проверка на существующий дизлайк
            const dislikeCheck = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: 'dislike' },
                },
            })

            if (dislikeCheck) {
                return { message: 'Already disliked' }
            }

            // Проверка на лайк
            const likeCheck = await prisma.like.findUnique({
                where: { userId_postId_type: { userId, postId, type: 'like' } },
            })

            if (likeCheck) {
                // Обработка смены с лайка на дизлайк
                await prisma.like.update({
                    where: { id: likeCheck.id },
                    data: { type: 'dislike' },
                })

                const updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { decrement: 1 },
                        dislikes: { increment: 1 },
                    },
                })

                await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: {
                        likes: { decrement: 1 },
                        dislikes: { increment: 1 },
                    },
                })

                return {
                    message: 'dislike-added',
                    post: updatedPost,
                }
            }

            // Новый дизлайк
            await prisma.like.create({
                data: { userId, postId, type: 'dislike' },
            })

            const updatedPost = await prisma.post.update({
                where: { id: postId },
                data: { dislikes: { increment: 1 } },
            })

            await prisma.info.update({
                where: { id: postWithInfo.info.id },
                data: { dislikes: { increment: 1 } },
            })

            return { message: 'dislike-added', post: updatedPost }
        })

        return result
    } catch (error) {
        console.error('Error disliking post:', error)
        throw new Error('Could not dislike the post')
    }
}

export default dislikeService
