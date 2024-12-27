import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dislikeService = async (postId: number, userId: number) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            // Захватываем пост с его информацией в транзакции
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo || !postWithInfo.info) {
                return { message: 'Post not found or missing info' }
            }

            // Проверка, есть ли уже дизлайк
            const existingDislike = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: 'dislike' },
                },
            })

            // Если есть, то возвращаем сообщение, что уже дизлайк
            if (existingDislike) {
                return { message: 'Already disliked' }
            }

            // Проверка, есть ли лайк
            const existingLike = await prisma.like.findUnique({
                where: { userId_postId_type: { userId, postId, type: 'like' } },
            })

            let updatedPost
            let updatedInfo

            if (existingLike) {
                // Если был лайк, меняем его на дизлайк
                updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { decrement: 1 }, // Убираем лайк
                        dislikes: { increment: 1 }, // Добавляем дизлайк
                    },
                })

                updatedInfo = await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: {
                        likes: { decrement: 1 },
                        dislikes: { increment: 1 },
                    },
                })

                // Обновляем тип лайка на дизлайк
                await prisma.like.update({
                    where: { id: existingLike.id },
                    data: { type: 'dislike' },
                })

                return {
                    message: 'like-switched-to-dislike',
                    post: updatedPost,
                }
            }

            // Если не было лайка, просто создаем дизлайк
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

            // Добавляем новый дизлайк
            await prisma.like.create({
                data: { userId, postId, type: 'dislike' },
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
