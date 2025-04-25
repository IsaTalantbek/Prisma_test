import deleteService from './service/deleteService.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const deletePostController = async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    const postId = parseInt(req.params.id, 10)

    // Проверка на правильность ID
    if (isNaN(postId)) {
        return res
            .status(400)
            .json({ message: 'Некорректный идентификатор поста' })
    }

    // Проверка на наличие токена
    if (!token) {
        return res
            .status(401)
            .json({ message: 'Непредвиденная ошибка, обновите страницу' })
    }

    try {
        // Проверка и декодирование токена синхронно
        const decoded: any = jwt.verify(token, secretKey)

        // Доступ к userId из токена
        const thisId = decoded.userId

        // Удаление поста
        const result = await deleteService(postId, thisId)

        if (!result) {
            return res.status(500).json({
                message: 'Ошибка при удалении поста, попробуйте снова',
            })
        }

        return res.status(200).json({
            message: 'Пост и все связанные данные успешно удалены',
        })
    } catch (error: any) {
        console.error(error.message || error)
        return res.status(500).json({ message: 'Упс, неполадки!' })
    }
}

export default deletePostController
