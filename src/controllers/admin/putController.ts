import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const putController = async (req: any, res: any) => {
    try {
        const { value, id } = req.body
        const result = await prisma.post.update({
            where: { id: id },
            data: { text: value },
        })

        if (!result) {
            return res.status(500).json({
                message: `неправильные значения`,
            })
        }
        return res.status(200).json({
            result,
        })
    } catch (error: any) {
        console.error(error)
        return res.status(500).json({ message: 'putadmin-500' })
    }
}

export default putController
