import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const banDB = async (id: number | string) => {
    try {
        if (typeof id !== 'number') {
            id = parseInt(id, 10)
        }

        const check = await prisma.user.findFirst({
            where: { id: id },
        })

        if (!check) {
            return 'ban-user-not-defined'
        }
        if (check.ban === 'yes') {
            const result = await prisma.user.update({
                where: { id: id },
                data: { ban: 'no' },
            })
            return result
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
