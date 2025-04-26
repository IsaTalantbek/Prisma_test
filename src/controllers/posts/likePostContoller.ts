import likeService from "./service/likeService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secretKey = process.env.JWT_SECRET || "hello";

const likePostController = async (req: any, res: any) => {
    const token = req.cookies["aAuthToken"];
    if (!token) {
        return res.status(401).send("Непредвиденная ошибка, обновите страницу");
    }

    const postId = parseInt(req.params.id, 10); // Убираем await для parseInt
    try {
        // Верификация токена синхронно, а не через callback
        const decoded = jwt.verify(token, secretKey) as any;

        // Доступ к данным из токена
        const userId = decoded.userId;

        // Вызываем сервис лайка
        const result = await likeService(postId, userId);

        // Обработка результата
        if (!result) {
            return res.status(500).json({ message: "like-error-500" });
        }
        if (result.message === "like-added") {
            return res.status(200).json({ message: "like-added" });
        }
        return res.status(500).json({ message: result.message });
    } catch (error: any) {
        // Отлавливаем любые ошибки и логируем их
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export default likePostController;
