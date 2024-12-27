import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Включает логи запросов
})

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'hello-WORLD-im-from-B'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh'

const refreshController = async (req: any, res: any) => {
    try {
        const { rAuthToken } = req.cookies

        if (!rAuthToken) {
            return res.status(401).json({ message: 'refresh-notfound-401' })
        }

        // Проверяем, действителен ли refresh token
        const decoded = jwt.verify(rAuthToken, JWT_REFRESH_SECRET) as any
        const { userId } = decoded

        const result = await prisma.user.findFirst({
            where: {
                id: userId,
            },
            include: {
                info: true, // Это включит информацию о пользователе вместе с данными из таблицы Info
            },
        })

        if (!result) {
            return res.status(500).json({ message: 'refresh-notexist-500' })
        }

        if (!result.info) {
            return res.status(500).json({ message: 'refresh-notexist-500' })
        }
        const newAccessToken = jwt.sign(
            {
                userId: userId,
                role: result.info.role,
                login: result.login,
                ban: result.ban,
            },
            JWT_SECRET,
            {
                expiresIn: '1h',
            }
        )

        // Отправляем новый access token в response
        res.cookie('aAuthToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 час
        })

        res.status(200).json({ message: 'refresh-200' })
    } catch (error: any) {
        console.error(error?.message || error)
        res.status(500).json({ message: 'refresh-error-500' })
    }
}

export default refreshController
