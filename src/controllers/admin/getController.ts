import { PrismaClient } from "@prisma/client";
import fetchDB from "../../service/fetchDB.js";

const prisma = new PrismaClient();

const getController = async (req: any, res: any) => {
    try {
        let { login, id, table } = req.query;

        id = parseInt(id, 10);

        if (table === "user" || table === "info") {
            const result = await fetchDB({ login, id, table });
            return res.status(200).json({ result });
        } else if (table === "post") {
            if (!id) {
                const result = await prisma.post.findMany();
                return res.status(200).json({ result });
            } else {
                const result = await prisma.post.findFirst({
                    where: { id: id }
                });
                return res.status(200).json({ result });
            }
        } else if (table === "like") {
            if (!id) {
                const result = await prisma.like.findMany();
                return res.status(200).json({ result });
            }
            const result = await prisma.like.findMany({
                where: { postId: id }
            });
            return res.status(200).json({ result });
        }
        return res.status(500).json({
            message: `возможно вы ввели неправильную таблицу: ${table}`
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "getadmin-500" });
    }
};

export default getController;
