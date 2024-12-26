import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const prisma = new PrismaClient()

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const postsController = async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }

    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const thisId = decoded.userId
            const posts = await prisma.post.findMany({
                include: { user: true },
            })
            return res.render('posts', {
                posts: posts,
                thisId: thisId,
            })
        })
    } catch (error: any) {
        console.error(error?.message || error)
        return res.status(500).json({ message: 'упс, неполадки!' })
    }
}
export default postsController
