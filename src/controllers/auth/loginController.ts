import { PrismaClient, User } from "@prisma/client";
import fetchDB from "../../service/fetchDB.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hello-WORLD-im-from-B";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret-refresh"; // Для refresh токена

const loginController = async (req: any, res: any) => {
    try {
        let { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ message: "login-incorrect-400" });
        }
        const existUser =
            ((await fetchDB({ login, table: "user" })) as User) || null;

        if (!existUser) {
            return res.status(500).json({ message: "login-usernotexist-500" });
        }

        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "login-incorrect-400" });
        }

        const result = await prisma.info.findFirst({
            where: { userId: existUser.id }
        });
        if (!result) {
            console.error("У человека не найден профиль", result, existUser);
            return res.status(500).json({ message: "login-error-500" });
        }
        const accessToken = jwt.sign(
            {
                userId: existUser.id,
                role: result.role,
                login: existUser.login,
                ban: existUser.ban
            }, // Используем правильные данные
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
            { userId: existUser.id },
            JWT_REFRESH_SECRET,
            { expiresIn: "7d" } // 7 дней
        );
        res.cookie("aAuthToken", accessToken, {
            httpOnly: true, // Доступ к куке только через HTTP, не через JS
            secure: process.env.NODE_ENV === "production", // Secure flag только в production (для HTTPS)
            maxAge: 3600000 // Срок действия куки 1 час (в миллисекундах)
        });
        res.cookie("rAuthToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 604800000 // 7 дней
        });

        res.status(200).json({ message: "login-200", data: { existUser } });
    } catch (error: any) {
        console.error(error?.message || error);
        res.status(500).json({ message: "create-error-500" });
    }
};

export default loginController;
