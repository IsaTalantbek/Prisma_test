import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const likeService = async (postId, userId) => {
    try {
        // Проверка наличия поста и связанной информации
        const postWithInfo = await prisma.post.findFirst({
            where: { id: postId },
            include: { info: true },
        });
        if (!postWithInfo) {
            return { message: 'likepost-notfoundpost-500' };
        }
        if (!postWithInfo.info) {
            return { message: 'likepost-notfoundinfo-500' };
        }
        // Поиск существующего лайка
        const likeCheck = await prisma.like.findFirst({
            where: { userId: userId, postId: postId },
        });
        // Логика обработки лайков/дизлайков
        if (likeCheck) {
            if (likeCheck.type === 'like') {
                return { message: 'like-userliked-500' }; // Пользователь уже лайкнул пост
            }
            if (likeCheck.type === 'dislike') {
                // Если был дизлайк — убираем дизлайк и добавляем лайк
                await prisma.$transaction([
                    prisma.post.update({
                        where: { id: postId },
                        data: {
                            likes: { increment: 1 },
                            dislikes: { decrement: 1 },
                        },
                    }),
                    prisma.info.update({
                        where: { id: postWithInfo.info.id },
                        data: {
                            likes: { increment: 1 },
                            dislikes: { decrement: 1 },
                        },
                    }),
                    prisma.like.update({
                        where: { id: likeCheck.id },
                        data: { type: 'like' },
                    }),
                ]);
                return {
                    message: 'like-changed-from-dislike-to-like',
                    post: postWithInfo,
                };
            }
        }
        else {
            // Если лайка не было — создаем лайк
            await prisma.$transaction([
                prisma.post.update({
                    where: { id: postId },
                    data: { likes: { increment: 1 } },
                }),
                prisma.info.update({
                    where: { id: postWithInfo.info.id },
                    data: { likes: { increment: 1 } },
                }),
                prisma.like.create({
                    data: { userId: userId, postId: postId, type: 'like' },
                }),
            ]);
            return { message: 'like-added', post: postWithInfo };
        }
    }
    catch (error) {
        console.error('Error liking post:', error);
        throw new Error('Could not like the post');
    }
};
export default likeService;
