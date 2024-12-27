import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dislikeService = async (postId: number, userId: number) => {
    try {
        // Выполняем всё в одной транзакции
        const result = await prisma.$transaction(async (prisma) => {
            // Проверка наличия поста и связанной информации
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo) {
                return { message: 'dislikepost-notfoundpost-500' }
            }

            if (!postWithInfo.info) {
                return { message: 'dislikepost-notfoundinfo-500' }
            }

            // Поиск существующего лайка/дизлайка
            const likeCheck = await prisma.like.findFirst({
                where: { userId: userId, postId: postId },
            })

            if (likeCheck) {
                if (likeCheck.type === 'dislike') {
                    return { message: 'dislike-userdisliked-500' } // Пользователь уже дизлайкнул пост
                }

                if (likeCheck.type === 'like') {
                    // Убираем лайк и ставим дизлайк
                    await prisma.post.update({
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

                    await prisma.like.update({
                        where: { id: likeCheck.id },
                        data: { type: 'dislike' },
                    })

                    return {
                        message: 'dislike-changed-from-like-to-dislike',
                        post: postWithInfo,
                    }
                }
            } else {
                // Если лайка/дизлайка не было — создаём новый дизлайк
                await prisma.post.update({
                    where: { id: postId },
                    data: { dislikes: { increment: 1 } },
                })

                await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: { dislikes: { increment: 1 } },
                })

                await prisma.like.create({
                    data: { userId: userId, postId: postId, type: 'dislike' },
                })

                return { message: 'dislike-added', post: postWithInfo }
            }
        })

        return result // Результат из транзакции
    } catch (error) {
        console.error('Error disliking post:', error)
        throw new Error('Could not dislike the post')
    }
}

export default dislikeService
