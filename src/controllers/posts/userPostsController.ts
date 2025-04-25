import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const prisma = new PrismaClient()

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const userPostsController = async (req: any, res: any) => {
    const id = parseInt(req.params.userId, 10)

    if (isNaN(id)) {
        return res.status(400).send('Неправильные значения')
    }

    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }

    try {
        // Использование промиса для jwt.verify
        const decoded: any = await new Promise((resolve, reject) => {
            jwt.verify(token, secretKey, (err: any, decoded: any) => {
                if (err) {
                    return reject(err)
                }
                resolve(decoded)
            })
        })

        // Доступ к данным из токена
        const thisId = decoded.userId

        // Запрос к базе данных для получения постов
        const posts = await prisma.post.findMany({
            where: { userId: id },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        })

        // Рендер страницы с постами
        return res.render('posts', {
            posts: posts,
            thisId: thisId,
        })
    } catch (error: any) {
        console.error(error?.message || error)
        return res.status(500).json({ message: 'Упс, неполадки!' })
    }
}

export default userPostsController
