import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET || "hello";

const prisma = new PrismaClient();

const profileController = async (req: any, res: any) => {
    const token = req.cookies["aAuthToken"];
    if (!token) {
        return res.status(401).send("Непредвиденная ошибка, обновите страницу");
    }

    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send("Непредвиденная ошибка, обновите страницу");
            }

            // Доступ к данным из токена
            const userId = decoded.userId;
            const user = await prisma.user.findFirst({
                where: { id: userId },
                include: { info: true }
            });
            if (!user) {
                return res
                    .status(500)
                    .json({ message: "refresh-notexist-500" });
            }
            if (!user.info) {
                return res
                    .status(500)
                    .json({ message: "refresh-notexist-500" });
            }

            return res.render("profile", {
                userId: userId,
                username: user.username,
                login: user.login,
                info: user.info.info,
                gender: user.info.gender,
                age: user.info.age,
                likes: user.info.likes,
                dislikes: user.info.dislikes,
                postsCount: user.info.postCount
            });
        });
    } catch (error: any) {
        console.error(error?.message || error);
        return res.status(500).json({ message: "упс, неполадки!" });
    }
};

export default profileController;
