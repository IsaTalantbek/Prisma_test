import dislikeService from './service/dislikeService'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const dislikePostController = async (req: any, res: any) => {
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

            const result = await dislikeService(postId, userId)

            if (!result) {
                return res.status(500).json({ message: 'dislike-error-500' })
            }
            if (result.message === 'dislike-added') {
                return res.status(200).json({ message: 'dislike-added' })
            }
            return res.status(500).json({ message: result })
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).json({ error: error.message })
    }
}

export default dislikePostController
