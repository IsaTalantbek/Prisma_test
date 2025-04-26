import express, { Application, Request, Response } from "express";
import publicRouter from "./routes/publicRouter.js";
import protectedRouter from "./routes/protectedRouter.js";
import apiRouter from "./routes/apiRouter.js";
import dotenv from "dotenv";
import { authenticateToken } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorMiddleware.js";
import protectedPath from "./path/protected.js";
import errorPath from "./path/errorPath.js";
import adminGive from "./service/giveAdmin.js";
dotenv.config();

const PORT = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : process.env.NODE_ENV === "production"
      ? (() => {
            throw new Error("Не указан PORT в .env");
        })()
      : 3000;

const app: Application = express();
dotenv.config();

app.set("views", protectedPath);

app.set("view engine", "ejs");

app.use(errorHandler);
app.use(express.json());
app.use(cookieParser());

app.get("/logout", async (_: Request, res: Response) => {
    res.clearCookie("aAuthToken", { httpOnly: true, secure: true });
    res.clearCookie("rAuthToken", { httpOnly: true, secure: true }); // Если ваш сайт использует HTTPS, добавьте secure: true
    res.redirect("/login");
});
app.use("/a", authenticateToken, protectedRouter);
app.use("/", publicRouter);
app.use("/api", apiRouter);

if (process.env.NODE_ENV !== "production") {
    app.get(
        "/example.com/admin/4k43hf8d79d5be8d0c0fe391be67af9d3194923982c84776bd847576d86db86d77ad8",
        adminGive
    );
}
app.use((_, res) => {
    res.status(404).sendFile(errorPath);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`server started, port: ${PORT}`);
});
