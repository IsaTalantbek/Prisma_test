import likeService from './service/likeService'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const likePostController = async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }
    const postId = await parseInt(req.params.id, 10)
    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const userId = decoded.userId

            const result = await likeService(postId, userId)

            if (!result) {
                return res.status(500).json({ message: 'like-error-500' })
            }
            if (
                result.message === 'like-added' ||
                result.message === 'like-changed-from-dislike-to-like'
            ) {
                return res.status(200).json({ message: 'like-added' })
            }
            return res.status(500).json({ message: result.message })
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

export default likePostController
