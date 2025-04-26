import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userLoginProfileController = async (req: any, res: any) => {
    const userLogin = req.params.login;
    try {
        const user = await prisma.user.findFirst({
            where: { login: userLogin },
            include: { info: true }
        });

        if (!user) {
            return res.status(500).send("Похоже, такого человека нет");
        }
        if (!user.info) {
            return res
                .status(500)
                .send("Похоже, информация этого человека удалена");
        }

        res.render("userProfile", {
            username: user.username,
            login: user.login,
            age: user.info.age,
            info: user.info.info,
            gender: user.info.gender
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).send("Серверная ошибка, хз че случилось");
    }
};

export default userLoginProfileController;
