import { Response, Router } from "express";
import refreshController from "../controllers/auth/refreshController.js";
import regPath from "../path/public/regPath.js";
import loginPath from "../path/public/loginPath.js";
import { redirectIfAuthenticated } from "../middleware/authMiddleware.js";

const router = Router();

// Маршрут для главной страницы
router.get("/reg", redirectIfAuthenticated, (_, res: Response) => {
    res.sendFile(regPath);
});
router.get("/login", redirectIfAuthenticated, (_, res: Response) => {
    res.sendFile(loginPath);
});
router.get("/refresh-auth", refreshController);

export default router;
