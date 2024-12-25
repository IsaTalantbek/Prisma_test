import { PrismaClient } from '@prisma/client'
import fetchDB from '../../service/fetchDB'

const prisma = new PrismaClient()

const getController = async (req: any, res: any) => {
    try {
        const { login, id, table } = req.query

        if (table === 'user' || table === 'info') {
            const result = await fetchDB({ login, id, table })
            return res.status(200).json({ result })
        } else if (table === 'post') {
            if (!id) {
                const result = await prisma.post.findMany()
                return res.status(200).json({ result })
            } else {
                const result = await prisma.post.findFirst({
                    where: { id: id },
                })
                return res.status(200).json({ result })
            }
        }
        return res.status(200).json({
            message: `возможно вы ввели неправильную таблицу: ${table}`,
        })
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ message: 'getadmin-500' })
    }
}

export default getController
