import createDB from '../../service/createDB'
import checkAge from '../../check/ageCheck'
import checkInfo from '../../check/infoCheck'
import checkLogin from '../../check/loginCheck'
import checkPassword from '../../check/passwordCheck'
import checkGender from '../../check/genderCheck'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'hello-WORLD-im-from-B'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'secret-refresh' // Для refresh токена

const regController = async (req: any, res: any) => {
    try {
        let { login, password, username, age, info, gender } = req.body
        console.log(req.body) // Для проверки, что приходит с клиента
        if (!login || !password) {
            return res
                .status(400)
                .json({ message: 'create-login/password-500' })
        }
        age = parseInt(age, 10)
        if (!(await checkLogin(login))) {
            return res.status(400).json({ message: 'invalid-login-400' })
        }
        if (!(await checkPassword(password))) {
            return res.status(400).json({ message: 'invalid-password-400' })
        }

        if (age && !(await checkAge(age))) {
            return res.status(400).json({ message: 'invalid-age-400' })
        }
        if (gender && !(await checkGender(gender))) {
            return res.status(400).json({ message: 'invalid-gender-400' })
        }
        if (info && !(await checkInfo(info))) {
            return res.status(400).json({ message: 'invalid-info-400' })
        }
        if (username && !(await checkLogin(username))) {
            return res.status(400).json({ message: 'invalid-username-400' })
        }
        password = await bcrypt.hash(password, 10)

        const result = await createDB({
            login,
            password,
            username,
            age,
            info,
            gender,
        })

        if (!result.user) {
            return res.status(500).json({ message: result.message })
        }
        const accessToken = jwt.sign(
            {
                userId: result.user.id,
                role: result.userInfo.role,
                login: result.user.login,
            }, // Используем правильные данные
            JWT_SECRET,
            { expiresIn: '1h' }
        )
        const refreshToken = jwt.sign(
            { userId: result.user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' } // 7 дней
        )
        res.cookie('aAuthToken', accessToken, {
            httpOnly: true, // Доступ к куке только через HTTP, не через JS
            secure: process.env.NODE_ENV === 'production', // Secure flag только в production (для HTTPS)
            maxAge: 3600000, // Срок действия куки 1 час (в миллисекундах)
        })
        res.cookie('rAuthToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 604800000, // 7 дней
        })

        res.status(200).json({ message: 'create-200', data: { result } })
    } catch (error: any) {
        console.error(error?.message || error)
        res.status(500).json({ message: 'create-error-500' })
    }
}

export default regController
