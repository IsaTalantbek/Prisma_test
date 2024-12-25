import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const createPostService = async (userId, text) => {
    const user = await prisma.user.findFirst({
        where: { id: userId },
        include: { info: true },
    });
    if (!user) {
        return { message: 'createpost-user-notexist-500' };
    }
    if (!user.info) {
        return { message: 'createpost-info-notexist-500' };
    }
    const result = await prisma.post.create({
        data: {
            text: text,
            userId: user.id,
            infoId: user.info.id,
        },
    });
    await prisma.info.update({
        where: { userId: userId },
        data: { postCount: { increment: 1 } },
    });
    if (!result) {
        return { message: 'createpost-database-create-error-500' };
    }
    return { message: 'createPost-create-200', result: result };
};
export default createPostService;
