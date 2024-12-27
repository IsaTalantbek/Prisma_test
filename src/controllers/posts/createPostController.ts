import checkInfo from '../../check/infoCheck'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import createPostService from './service/createService'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const createPostController = async (req: any, res: any) => {
    const { text } = req.body
    const token = req.cookies['aAuthToken']

    // Проверка наличия токена
    if (!token) {
        return res
            .status(401)
            .json({ message: 'Непредвиденная ошибка, обновите страницу' })
    }

    // Проверка на пустой текст
    if (!text) {
        return res.status(400).json({ message: 'Ничего не пришло' })
    }

    // Проверка на валидность текста
    if (!(await checkInfo(text))) {
        return res
            .status(400)
            .json({ message: 'Текст должен быть не больше 250 символов' })
    }

    try {
        // Проверяем токен с использованием синхронной функции
        const decoded: any = jwt.verify(token, secretKey)

        // Доступ к данным из токена
        const userId = decoded.userId

        // Создаем пост
        const result = await createPostService(userId, text)

        if (!result) {
            return res
                .status(500)
                .json({ message: 'Ошибка создания поста, попробуйте позже' })
        }

        if (result.message === 'createPost-create-200') {
            return res.status(200).json({ message: 'Пост успешно добавлен' })
        }

        return res.status(500).json({ message: result.message })
    } catch (error: any) {
        console.error(error)
        return res
            .status(500)
            .json({ message: 'Непредвиденная ошибка', error: error.message })
    }
}

export default createPostController
