import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
dotenv.config();
const __dirname = path.resolve();
const loginPagePath = path.join(__dirname, 'src', 'views', 'login.html');
const errorPage = path.join(__dirname, 'src', 'views', 'error.html');
const JWT_SECRET = process.env.JWT_SECRET || 'hello-WORLD-im-from-B';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh';
export const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.aAuthToken;
    if (!token) {
        console.log('No access token found');
        // Обновляем токен, если его нет
        try {
            const { rAuthToken } = req.cookies;
            if (!rAuthToken) {
                return res.sendFile(loginPagePath);
            }
            // Проверяем refresh token
            const decoded = jwt.verify(rAuthToken, JWT_REFRESH_SECRET);
            const userId = decoded.userId;
            // Ищем пользователя в базе данных
            const user = await prisma.user.findFirst({
                where: { id: userId },
                include: { info: true },
            });
            if (!user || !user.info) {
                return res
                    .status(401)
                    .json({ message: 'User not found or invalid info' });
            }
            // Создаем новый Access Token
            const newAccessToken = jwt.sign({ userId: userId, role: user.info.role, login: user.login }, JWT_SECRET, { expiresIn: '1h' });
            console.log(newAccessToken);
            // Отправляем новый токен в cookies
            res.cookie('aAuthToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000, // 1 час
            });
            // Переходим к следующему middleware
            return next();
        }
        catch (error) {
            console.error('Error while refreshing token:', error.message || error);
            return res.status(500).json({ message: 'Token refresh failed' });
        }
    }
    // Проверяем текущий access token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Access token verification failed:', err.message);
            return res.sendStatus(403); // Ошибка токена
        }
        req.user = user; // Записываем декодированные данные в req.user
        next(); // Продолжаем выполнение, если авторизация прошла успешно
    });
};
export const checkRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.sendStatus(403); // Если нет пользователя, отправляем ошибку
        }
        if (req.user.role !== role) {
            // Если роль пользователя не соответствует ожидаемой, отправляем страницу ошибки
            return res.sendFile(errorPage); // Путь к странице ошибки
        }
        next(); // Продолжаем выполнение, если роль соответствует
    };
};
export const redirectIfAuthenticated = async (req, res, next) => {
    const token = req.cookies?.aAuthToken; // Читаем токен из куки
    if (token) {
        try {
            // Проверка аутентификации по основному токену
            jwt.verify(token, JWT_SECRET, (err) => {
                if (err) {
                    // Если токен невалиден, очищаем cookie и продолжаем
                    res.clearCookie('aAuthToken');
                    return next();
                }
                // Если токен валиден, перенаправляем на профиль
                return res.redirect('/a/main');
            });
        }
        catch (error) {
            console.error('Error while verifying token:', error.message || error);
            return res
                .status(500)
                .json({ message: 'Error during token verification' });
        }
    }
    else {
        const { rAuthToken } = req.cookies;
        if (rAuthToken) {
            try {
                // Проверяем refresh token
                const decoded = jwt.verify(rAuthToken, JWT_REFRESH_SECRET);
                const userId = decoded.userId;
                // Ищем пользователя в базе данных
                const user = await prisma.user.findFirst({
                    where: { id: userId },
                    include: { info: true },
                });
                if (!user || !user.info) {
                    return res
                        .status(401)
                        .json({ message: 'User not found or invalid info' });
                }
                // Создаем новый Access Token
                const newAccessToken = jwt.sign({ userId: userId, role: user.info.role, login: user.login }, JWT_SECRET, { expiresIn: '1h' });
                // Отправляем новый токен в cookies
                res.cookie('aAuthToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3600000, // 1 час
                });
                res.redirect('/a/main');
            }
            catch (error) {
                console.error('Error while refreshing token:', error.message || error);
                return res.status(500).json({ message: 'Token refresh failed' });
            }
        }
        else {
            return next(); // Если нет токенов, просто переходим дальше
        }
    }
};
