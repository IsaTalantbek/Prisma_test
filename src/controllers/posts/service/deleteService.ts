import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const deleteService = async (
    postId: string | number,
    thisId: string | number
) => {
    // Преобразуем в число, если переменные типа string
    if (typeof postId === 'string') {
        postId = parseInt(postId, 10)
    }
    if (typeof thisId === 'string') {
        thisId = parseInt(thisId, 10)
    }

    // Проверяем, не NaN ли обе переменные после преобразования
    if (isNaN(postId) || isNaN(thisId)) {
        return 'invalid postId or thisId'
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })

    if (!post || post.userId !== thisId) {
        return 'отсутствует пост, или вы не имеете права удалять этот пост'
    }

    await prisma.like.deleteMany({
        where: { postId: postId },
    })

    await prisma.post.delete({ where: { id: postId } })

    await prisma.info.update({
        where: { userId: thisId },
        data: { postCount: { decrement: 1 } },
    })
    return true
}

export default deleteService
