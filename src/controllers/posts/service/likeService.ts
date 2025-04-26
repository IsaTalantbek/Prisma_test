import { PrismaClient } from "@prisma/client";
import { Mutex } from "async-mutex";

const prisma = new PrismaClient();
const userMutex = new Map(); // Хранение блокировок для пользователей

const getUserMutex = (userId: number) => {
    if (!userMutex.has(userId)) {
        userMutex.set(userId, new Mutex());
    }
    return userMutex.get(userId);
};

const likeService = async (postId: number, userId: number) => {
    const mutex = getUserMutex(userId);
    const release = await mutex.acquire(); // Блокировка только для пользователя
    try {
        const result = await prisma.$transaction(async (prisma) => {
            const postWithInfo = await prisma.post.findFirst({
                where: { id: postId },
                include: { info: true }
            });

            if (!postWithInfo || !postWithInfo.info) {
                return { message: "Post not found or missing info" };
            }

            const existingLike = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: "like" }
                }
            });

            if (existingLike) {
                return { message: "Already liked" };
            }

            const existingDislike = await prisma.like.findUnique({
                where: {
                    userId_postId_type: { userId, postId, type: "dislike" }
                }
            });

            let updatedPost;
            //let updatedInfo;

            if (existingDislike) {
                await prisma.like.update({
                    where: { id: existingDislike.id },
                    data: { type: "like" }
                });

                updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        likes: { increment: 1 },
                        dislikes: { decrement: 1 }
                    }
                });

                //updatedInfo = await prisma.info.update({
                //    where: { id: postWithInfo.info.id },
                //    data: {
                //        likes: { increment: 1 },
                //        dislikes: { decrement: 1 }
                //    }
                // });

                return {
                    message: "like-added",
                    post: updatedPost
                };
            }

            await prisma.like.create({
                data: { userId, postId, type: "like" }
            });

            updatedPost = await prisma.post.update({
                where: { id: postId },
                data: {
                    likes: { increment: 1 }
                }
            });

            //updatedInfo = await prisma.info.update({
            //    where: { id: postWithInfo.info.id },
            //    data: {
            //        likes: { increment: 1 }
            //    }
            //});

            return { message: "like-added", post: updatedPost };
        });

        return result;
    } finally {
        release(); // Освобождение блокировки для пользователя
    }
};

export default likeService;
