import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const likeService = async (postId: number, userId: number) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            // Захватываем пост в рамках транзакции и блокируем его для дальнейшей обработки
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo || !postWithInfo.info) {
                return { message: 'Post not found or missing info' }
            }

            // Проверка наличия лайка или дизлайка
            const existingLike = await prisma.like.findUnique({
                where: { userId_postId_type: { userId, postId, type: 'like' } },
            })
            const existingDislike = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: 'dislike' },
                },
            })

            if (existingLike) {
                // Если лайк уже существует, возвращаем ошибку
                return { message: 'Already liked' }
            }

            if (existingDislike) {
                // Если был дизлайк, изменяем тип с 'dislike' на 'like' и обновляем статистику
                const updatedLike = await prisma.like.update({
                    where: { id: existingDislike.id },
                    data: { type: 'like' },
                })

                // Обновление поста для снятия дизлайка и увеличения лайка
                const updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { increment: 1 },
                        dislikes: { decrement: 1 },
                    },
                })

                // Обновление статистики лайков и дизлайков в модели Info
                await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: {
                        likes: { increment: 1 },
                        dislikes: { decrement: 1 },
                    },
                })

                return { message: 'like-added', post: updatedPost }
            }

            // Если ни лайка, ни дизлайка нет, создаем новый лайк
            await prisma.like.create({
                data: { userId, postId, type: 'like' },
            })

            const updatedPost = await prisma.post.update({
                where: { id: postId },
                data: {
                    likes: { increment: 1 },
                },
            })

            await prisma.info.update({
                where: { id: postWithInfo.info.id },
                data: {
                    likes: { increment: 1 },
                },
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
