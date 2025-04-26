import { Request, Response, Router } from "express";
import createPostPath from "../path/posts/createPath.js";
import createPostController from "../controllers/posts/createPostController.js";
import dislikePostController from "../controllers/posts/dislikePostController.js";
import likePostController from "../controllers/posts/likePostContoller.js";
import deletePostController from "../controllers/posts/deletePostController.js";
import postsController from "../controllers/posts/postsController.js";
import userPostsController from "../controllers/posts/userPostsController.js";

const router = Router();

router.get("/", postsController);

router.delete("/:id/delete", deletePostController);

router.post("/:id/like", likePostController);

router.post("/:id/dislike", dislikePostController);

router.get("/:userId/posts", userPostsController);

router.get("/create", async (_: Request, res: Response) => {
    res.sendFile(createPostPath);
});

router.post("/createPost", createPostController);

export default router;
