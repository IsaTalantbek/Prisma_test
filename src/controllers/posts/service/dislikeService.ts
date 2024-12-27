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

            // Проверка на существующий лайк/дизлайк
            const likeCheck = await prisma.like.findFirst({
                where: { userId, postId },
            })

            if (likeCheck) {
                if (likeCheck.type === 'dislike') {
                    return { message: 'Already disliked' }
                }
                if (likeCheck.type === 'like') {
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
                        message: 'Changed from like to dislike',
                        post: updatedPost,
                    }
                }
            } else {
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

                return { message: 'Dislike added', post: updatedPost }
            }
        })

        return result
    } catch (error) {
        console.error('Error disliking post:', error)
        throw new Error('Could not dislike the post')
    }
}

export default dislikeService
