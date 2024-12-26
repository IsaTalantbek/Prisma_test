import deleteService from './service/deleteService'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const deletePostController = async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    const postId = parseInt(req.params.id, 10)

    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }
    if (isNaN(postId)) {
        return res.status(400).send('Некорректный идентификатор поста')
    }

    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            const thisId = decoded.userId
            const result = await deleteService(postId, thisId)

            if (!result) {
                return res.status(500).json({ message: result })
            }

            return res.status(200).json({
                message: 'Пост и все связанные данные успешно удалены',
            })
        })
    } catch (error: any) {
        console.error(error.message || error)
        return res.status(500).json({ message: 'Упс, неполадки!' })
    }
}

export default deletePostController
