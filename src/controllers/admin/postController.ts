import createDB from "../../service/createDB.js";

const postController = async (req: any, res: any) => {
    try {
        const { login, password } = req.body;

        if (typeof login !== "string" || typeof password !== "string") {
            return res
                .status(500)
                .json({
                    message: "postAdmin-password-or-login-not-string-500"
                });
        }

        const result = await createDB({ login, password });

        if (!result) {
            return res.status(500).json({
                message: `неправильные значения`
            });
        }
        if (result.message) {
            return res.status(500).json({ result });
        }
        return res.status(200).json({
            result
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: "postadmin-500" });
    }
};

export default postController;
