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
                include: { info: true },
            })
            if (!user) {
                return res
                    .status(500)
                    .json({ message: 'незнаю как, но у поста нет создателя' })
            }
            const result = await prisma.post.delete({
                where: { id: id },
            })
            await prisma.like.deleteMany({
                where: { postId: id },
            })

            await prisma.info.update({
                where: { userId: user.info.likes },
                data: { postCount: { decrement: 1 } },
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