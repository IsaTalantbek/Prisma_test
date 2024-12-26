import checkInfo from '../../check/infoCheck'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import createPostService from './service/createService'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello'

const createPostController = async (req: any, res: any) => {
    const { text } = req.body

    const token = req.cookies['aAuthToken']

    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
    }

    if (!text) {
        return res.status(400).json({ message: 'Ничего не пришло' })
    }
    if (!(await checkInfo(text))) {
        return res
            .status(401)
            .json({ message: 'текст должен быть не больше 250 символов' })
    }
    try {
        jwt.verify(token, secretKey, async (err: any, decoded: any) => {
            if (err) {
                return res
                    .status(401)
                    .send('Непредвиденная ошибка, обновите страницу')
            }

            // Доступ к данным из токена
            const userId = decoded.userId

            const result = await createPostService(userId, text)

            if (!result) {
                return res.status(500).json({ message: 'createPost-error-500' })
            }
            if (result.message === 'createPost-create-200') {
                return res.status(200).json({ message: 'createPost-added' })
            }
            return res.status(500).json({ message: result.message, result })
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
        console.error(error)
    }
}

export default createPostController
