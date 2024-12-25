import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const banDB = async (id: number | string) => {
    try {
        if (typeof id !== 'number') {
            id = parseInt(id, 10)
        }
        const result = await prisma.user.update({
            where: { id: id },
            data: { ban: 'yes' },
        })
        return result
    } catch (error: any) {
        console.error(error.stack)
        throw error
    }
}

export default banDB
