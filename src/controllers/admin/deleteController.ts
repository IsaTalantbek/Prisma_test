import { PrismaClient } from '@prisma/client'
import banDB from '../../service/banDB'

const prisma = new PrismaClient()

const deleteController = async (req: any, res: any) => {
    try {
        let { id, table } = req.query

        id = parseInt(id, 10)

        if (!id) {
            return res.status(500).json({ message: 'deleteAdmin-notid-500' })
        }

        if (!table || table === 'user') {
            const result = await banDB(id)
            return res.status(200).json({ result })
        } else if (table === 'post') {
            const user = await prisma.post.findFirst({
                where: { id: id },
            })
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'незнаю как, но у поста нет создателя' })
            }
            await prisma.like.deleteMany({
                where: { postId: id },
            })
            await prisma.info.update({
                where: { id: user.infoId },
                data: {
                    likes: { decrement: user.likes },
                    dislikes: { decrement: user.dislikes },
                    postCount: { decrement: 1 },
                },
            })
            const result = await prisma.post.delete({
                where: { id: id },
            })

            return res.status(200).json({ result })
        }
        return res.status(500).json({ message: 'deleteAdmin-invalid-500' })
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ message: 'deleteAdmin-error-500' })
    }
}

export default deleteController
