import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import loginPath from '../path/public/loginPath'
import errorPath from '../path/errorPath'

const prisma = new PrismaClient()

dotenv.config()
const loginPagePath = loginPath
const errorPage = errorPath

const JWT_SECRET = process.env.JWT_SECRET || 'hello-WORLD-im-from-B'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh'

export const authenticateToken = async (req: any, res: any, next: any) => {
    const token = req.cookies?.aAuthToken

    if (!token) {
        // Логика с обновлением access token через refresh token
        try {
            const { rAuthToken } = req.cookies
            if (!rAuthToken) {
                return res.sendFile(loginPagePath)
            }

            // Проверка refresh token
            const decoded = jwt.verify(rAuthToken, JWT_REFRESH_SECRET) as any
            const userId = decoded.userId

            // Логика с верификацией пользователя
            const user = await prisma.user.findFirst({
                where: { id: userId },
                include: { info: true },
            })
            if (!user || !user.info) {
                return res
                    .status(401)
                    .json({ message: 'User not found or invalid info' })
            }

            // Генерация нового access token
            const newAccessToken = jwt.sign(
                { userId, role: user.info.role, login: user.login },
                JWT_SECRET,
                { expiresIn: '1h' }
            )

            // Отправляем новый токен в cookies
            res.cookie('aAuthToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000, // 1 час
            })

            return next()
        } catch (error: any) {
            console.error('Error refreshing token:', error.message || error)
            res.clearCookie('aAuthToken', { httpOnly: true, secure: true })
            res.clearCookie('rAuthToken', { httpOnly: true, secure: true })
            return res.status(500).json({ message: 'Token refresh failed' })
        }
    }

    // Верификация текущего access token
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            console.log('Access token verification failed:', err.message)
            res.clearCookie('aAuthToken', { httpOnly: true, secure: true })
            res.clearCookie('rAuthToken', { httpOnly: true, secure: true })
            return res.sendStatus(403).redirect('/reg') // Токен поврежден или просрочен
        }
        req.user = user
        next()
    })
}

export const checkRole = (role: string) => {
    return (req: any, res: any, next: any) => {
        if (!req.user) {
            return res.sendStatus(403) // Если нет пользователя, отправляем ошибку
        }
        if (req.user.role !== role) {
            // Если роль пользователя не соответствует ожидаемой, отправляем страницу ошибки
            return res.sendFile(errorPage) // Путь к странице ошибки
        }
        next() // Продолжаем выполнение, если роль соответствует
    }
}

export const redirectIfAuthenticated = async (
    req: any,
    res: any,
    next: any
) => {
    const token = req.cookies?.aAuthToken // Читаем токен из куки

    if (token) {
        try {
            // Проверка аутентификации по основному токену
            jwt.verify(token, JWT_SECRET, (err: any) => {
                if (err) {
                    // Если токен невалиден, очищаем cookie и продолжаем
                    res.clearCookie('aAuthToken')
                    return next()
                }
                // Если токен валиден, перенаправляем на профиль
                return res.redirect('/a/main')
            })
        } catch (error: any) {
            console.error(
                'Error while verifying token:',
                error.message || error
            )
            return res
                .status(500)
                .json({ message: 'Error during token verification' })
        }
    } else {
        const { rAuthToken } = req.cookies
        if (rAuthToken) {
            try {
                // Проверяем refresh token
                const decoded = jwt.verify(
                    rAuthToken,
                    JWT_REFRESH_SECRET
                ) as any
                const userId = decoded.userId

                // Ищем пользователя в базе данных
                const user = await prisma.user.findFirst({
                    where: { id: userId },
                    include: { info: true },
                })

                if (!user || !user.info) {
                    return res
                        .status(401)
                        .json({ message: 'User not found or invalid info' })
                }

                // Создаем новый Access Token
                const newAccessToken = jwt.sign(
                    { userId: userId, role: user.info.role, login: user.login },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                )

                // Отправляем новый токен в cookies
                res.cookie('aAuthToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3600000, // 1 час
                })
                res.redirect('/a/main')
            } catch (error: any) {
                console.error(
                    'Error while refreshing token:',
                    error.message || error
                )
                return res.status(500).json({ message: 'Token refresh failed' })
            }
        } else {
            return next() // Если нет токенов, просто переходим дальше
        }
    }
}
