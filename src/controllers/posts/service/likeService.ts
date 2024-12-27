import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const likeService = async (postId: number, userId: number) => {
    try {
        const result = await prisma.$transaction(async (prisma) => {
            // Захватываем пост с его информацией в рамках транзакции
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

            let updatedPost
            let updatedInfo

            // Если у нас уже есть лайк
            if (existingLike) {
                return { message: 'Already liked' }
            }

            // Если у нас был дизлайк
            if (existingDislike) {
                // Начинаем переключение состояния с дизлайка на лайк
                updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { increment: 1 }, // Увеличиваем количество лайков
                        dislikes: { decrement: 1 }, // Уменьшаем количество дизлайков
                    },
                })
                // Обновление статистики в таблице info
                updatedInfo = await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: {
                        likes: { increment: 1 },
                        dislikes: { decrement: 1 },
                    },
                })
                // Обновляем тип в таблице like (с 'dislike' на 'like')
                const updatedLike = await prisma.like.update({
                    where: { id: existingDislike.id },
                    data: { type: 'like' },
                })

                return { message: 'like-switched', post: updatedPost }
            }

            // Если нет ни лайка, ни дизлайка — создаем новый лайк
            updatedPost = await prisma.post.update({
                where: { id: postId },
                data: {
                    likes: { increment: 1 },
                },
            })

            updatedInfo = await prisma.info.update({
                where: { id: postWithInfo.info.id },
                data: {
                    likes: { increment: 1 },
                },
            })

            // Создание нового лайка
            await prisma.like.create({
                data: { userId, postId, type: 'like' },
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
