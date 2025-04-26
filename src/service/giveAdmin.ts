import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hello-world";
const prisma = new PrismaClient(); // Создание экземпляра PrismaClient

const adminGive = async (req: any, res: any) => {
    const token = req.cookies?.aAuthToken;
    if (!token) {
        return res.status(403).send("Token is missing");
    }

    try {
        // Декодируем токен и получаем данные пользователя
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const userId = decoded.userId;

        // Обновляем роль пользователя в базе данных
        await prisma.info.update({
            where: { userId: userId },
            data: { role: "admin" }
        });
        res.clearCookie("aAuthToken", { httpOnly: true, secure: true });
        return res.redirect("/a/admin");
    } catch (error: Error | any) {
        console.log("Error:", error);
        return res.status(403).send("Access token verification failed"); // Ошибка токена или базы данных
    }
};

export default adminGive;
