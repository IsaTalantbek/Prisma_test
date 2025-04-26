import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

type UserInfoData = {
    gender: string;
    info: string;
    age: number;
};

interface CreateUserInput {
    login: string;
    password: string;
    username?: string;
    gender?: string;
    info?: string;
    age?: number;
}

async function createDB({
    login,
    password,
    username,
    gender,
    info,
    age
}: CreateUserInput) {
    if (!login || !password) {
        return { message: "create-login/password-500" };
    }

    if (info && info.length > 250) {
        return { message: "create-morethan250-500" };
    }

    username = username || login;

    try {
        // Проверяем, есть ли пользователь
        const existingUser = await prisma.user.findFirst({
            where: { login: login }
        });

        if (existingUser) {
            return { message: "create-userexist-500" };
        }
        password = await bcrypt.hash(password, 10);
        // Создаем пользователя
        const user = await prisma.user.create({
            data: {
                login,
                password,
                username
            }
        });

        // Создаем информацию о пользователе, избегая undefined для полей
        const userInfoData: UserInfoData = {
            gender: gender || "undefined",
            age: age || 0,
            info: info || "undefined" // Значение по умолчанию для info
        };

        const userInfo = await prisma.info.create({
            data: {
                userId: user.id,
                ...userInfoData
            }
        });

        // Обновляем поле infoId в таблице User
        await prisma.user.update({
            where: { id: user.id },
            data: { infoId: userInfo.id }
        });

        return { user, userInfo };
    } catch (error: Error | any) {
        console.error(error.stack);
        throw error;
    }
}

export default createDB;
