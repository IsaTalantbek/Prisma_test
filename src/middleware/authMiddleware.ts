import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import loginPath from "../path/public/loginPath.js";
import errorPath from "../path/errorPath.js";
import { NextFunction, Request, Response } from "express";
import { User } from "../types/request.js";

const prisma = new PrismaClient();

dotenv.config();
const loginPagePath = loginPath;
const errorPage = errorPath;

const JWT_SECRET = process.env.JWT_SECRET || "hello-WORLD-im-from-B";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret-refresh";

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.aAuthToken;

    if (!token) {
        // Логика с обновлением access token через refresh token
        try {
            const { rAuthToken } = req.cookies;
            if (!rAuthToken) {
                res.sendFile(loginPagePath);
                return;
            }

            // Проверка refresh token
            const decoded: User = jwt.verify(
                rAuthToken,
                JWT_REFRESH_SECRET
            ) as User;
            const userId = decoded.userId;

            // Логика с верификацией пользователя
            const user = await prisma.user.findFirst({
                where: { id: userId },
                include: { info: true }
            });
            if (!user || !user.info) {
                res.status(401).json({
                    message: "User not found or invalid info"
                });
                return;
            }

            const userData: User = {
                userId,
                role: user.info.role,
                login: user.login,
                ban: user.ban
            };

            // Генерация нового access token
            const newAccessToken = jwt.sign(userData, JWT_SECRET, {
                expiresIn: "1h"
            });

            // Отправляем новый токен в cookies
            res.cookie("aAuthToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000 // 1 час
            });

            return res.redirect(req.originalUrl);
        } catch (error: Error | any) {
            console.error("Error refreshing token:", error.message || error);
            res.clearCookie("aAuthToken", { httpOnly: true, secure: true });
            res.clearCookie("rAuthToken", { httpOnly: true, secure: true });
            res.redirect("/a/reg");
            return;
        }
    }

    // Верификация текущего access token
    jwt.verify(
        token,
        JWT_SECRET,
        async (err: Error | any, decoded: object | undefined | string) => {
            const payload = decoded as User;

            if (err) {
                console.log("Access token verification failed:", err.message);
                res.clearCookie("aAuthToken", { httpOnly: true, secure: true });
                res.clearCookie("rAuthToken", { httpOnly: true, secure: true });
                return res.redirect("/reg");
            }
            const ban = payload.ban;

            if (ban === "yes") {
                res.clearCookie("aAuthToken", { httpOnly: true, secure: true });
                res.clearCookie("rAuthToken", { httpOnly: true, secure: true });
                return res.send("Похоже, вы забанены^_^");
            }
            req.user = payload;
            next();
        }
    );
};

export const checkRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.sendFile(errorPage); // Если нет пользователя, отправляем ошибку
            return;
        }
        if (req.user.role !== role) {
            // Если роль пользователя не соответствует ожидаемой, отправляем страницу ошибки
            res.sendFile(errorPage); // Путь к странице ошибки
            return;
        }
        next(); // Продолжаем выполнение, если роль соответствует
    };
};

export const redirectIfAuthenticated = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.aAuthToken; // Читаем токен из куки

    if (token) {
        try {
            // Проверка аутентификации по основному токену
            jwt.verify(token, JWT_SECRET, (err: any) => {
                if (err) {
                    // Если токен невалиден, очищаем cookie и продолжаем
                    res.clearCookie("aAuthToken");
                    next();
                    return;
                }
                // Если токен валиден, перенаправляем на профиль
                res.redirect("/a/main");
                return;
            });
        } catch (error: Error | any) {
            console.error(
                "Error while verifying token:",
                error.message || error
            );
            res.status(500).json({
                message: "Error during token verification"
            });
            return;
        }
    } else {
        const { rAuthToken } = req.cookies;
        if (rAuthToken) {
            try {
                // Проверяем refresh token
                const decoded = jwt.verify(
                    rAuthToken,
                    JWT_REFRESH_SECRET
                ) as any;
                const userId = decoded.userId;

                // Ищем пользователя в базе данных
                const user = await prisma.user.findFirst({
                    where: { id: userId },
                    include: { info: true }
                });

                if (!user || !user.info) {
                    res.status(401).json({
                        message: "User not found or invalid info"
                    });
                    return;
                }

                // Создаем новый Access Token
                const newAccessToken = jwt.sign(
                    {
                        userId: userId,
                        role: user.info.role,
                        login: user.login,
                        ban: user.ban
                    },
                    JWT_SECRET,
                    { expiresIn: "1h" }
                );

                // Отправляем новый токен в cookies
                res.cookie("aAuthToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 3600000 // 1 час
                });
                res.redirect("/a/main");
            } catch (error: Error | any) {
                console.error(
                    "Error while refreshing token:",
                    error.message || error
                );
                res.status(500).json({ message: "Token refresh failed" });
                return;
            }
        } else {
            next(); // Если нет токенов, просто переходим дальше
            return;
        }
    }
};
