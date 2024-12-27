import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const likeService = async (postId: number, userId: number) => {
    try {
        // Выполняем всё в одной транзакции
        const result = await prisma.$transaction(async (prisma) => {
            // Проверка наличия поста и связанной информации
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true },
            })

            if (!postWithInfo) {
                return { message: 'likepost-notfoundpost-500' }
            }

            if (!postWithInfo.info) {
                return { message: 'likepost-notfoundinfo-500' }
            }

            // Поиск существующего лайка/дизлайка
            const likeCheck = await prisma.like.findFirst({
                where: { userId: userId, postId: postId },
            })

            if (likeCheck) {
                if (likeCheck.type === 'like') {
                    return { message: 'like-userdisliked-500' } // Пользователь уже дизлайкнул пост
                }

                if (likeCheck.type === 'dislike') {
                    // Убираем лайк и ставим дизлайк
                    await prisma.post.update({
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

                    await prisma.like.update({
                        where: { id: likeCheck.id },
                        data: { type: 'like' },
                    })

                    return {
                        message: 'like-changed-from-dislike-to-like',
                        post: postWithInfo,
                    }
                }
            } else {
                // Если лайка/дизлайка не было — создаём новый дизлайк
                await prisma.post.update({
                    where: { id: postId },
                    data: { likes: { increment: 1 } },
                })

                await prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: { likes: { increment: 1 } },
                })

                await prisma.like.create({
                    data: { userId: userId, postId: postId, type: 'like' },
                })

                return { message: 'like-added', post: postWithInfo }
            }
        })

        return result // Результат из транзакции
    } catch (error) {
        console.error('Error liking post:', error)
        throw new Error('Could not dislike the post')
    }
}

export default likeService
