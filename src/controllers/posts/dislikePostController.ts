import dislikeService from "./service/dislikeService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET || "hello";

const dislikePostController = async (req: any, res: any) => {
    const token = req.cookies["aAuthToken"];
    if (!token) {
        return res.status(401).send("Непредвиденная ошибка, обновите страницу");
    }

    const postId = parseInt(req.params.id, 10); // Убираем await для parseInt
    try {
        // Верификация токена синхронно
        const decoded = jwt.verify(token, secretKey) as any;

        // Доступ к данным из токена
        const userId = decoded.userId;

        // Вызываем сервис дизлайка
        const result = await dislikeService(postId, userId);

        // Обработка результата
        if (!result) {
            return res.status(500).json({ message: "dislike-error-500" });
        }
        if (result.message === "dislike-added") {
            return res.status(200).json({ message: "dislike-added" });
        }
        return res.status(500).json({ message: result.message }); // Здесь дополнительно обращаем внимание на возможное возвращаемое сообщение
    } catch (error: any) {
        // Логирование ошибок и возврат их пользователю
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export default dislikePostController;
