import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import checkLogin from '../../check/loginCheck'
import checkInfo from '../../check/infoCheck'
import checkAge from '../../check/ageCheck'
import checkGender from '../../check/genderCheck'

dotenv.config()

const secretKey = process.env.JWT_SECRET || 'hello-WORLD-im-from-B'

const prisma = new PrismaClient()

const router = Router()

router.get('/:id', async (req: any, res: any) => {
    const userId = await parseInt(req.params.id, 10)
    try {
        const user = await prisma.user.findFirst({
            where: { id: userId },
            include: { info: true },
        })

        if (!user) {
            return res.status(500).send('Похоже, такого человека нет')
        }
        if (!user.info) {
            return res
                .status(500)
                .send('Похоже, информация этого человека удалена')
        }

        res.render('userProfile', {
            username: user.username,
            login: user.login,
            age: user.info.age,
            info: user.info.info,
            gender: user.info.gender,
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).send('Ошибка загрузки профиля')
    }
})

router.get('/s/:login', async (req: any, res: any) => {
    const userLogin = req.params.login
    try {
        const user = await prisma.user.findFirst({
            where: { login: userLogin },
            include: { info: true },
        })

        if (!user) {
            return res.status(500).send('Похоже, такого человека нет')
        }
        if (!user.info) {
            return res
                .status(500)
                .send('Похоже, информация этого человека удалена')
        }

        res.render('userProfile', {
            username: user.username,
            login: user.login,
            age: user.info.age,
            info: user.info.info,
            gender: user.info.gender,
        })
    } catch (error: any) {
        console.error(error)
        res.status(500).send('Серверная ошибка, хз че случилось')
    }
})

router.get('/', async (req: any, res: any) => {
    const token = req.cookies['aAuthToken']
    if (!token) {
        return res.status(401).send('Непредвиденная ошибка, обновите страницу')
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
            const user = await prisma.user.findFirst({
                where: { id: userId },
                include: { info: true },
            })
            if (!user) {
                return res.status(500).json({ message: 'refresh-notexist-500' })
            }
            if (!user.info) {
                return res.status(500).json({ message: 'refresh-notexist-500' })
            }

            return res.render('profile', {
                username: user.username,
                login: user.login,
                info: user.info.info,
                gender: user.info.gender,
                age: user.info.age,
                likes: user.info.likes,
                dislikes: user.info.dislikes,
                postsCount: user.info.postCount,
            })
        })
    } catch (error: any) {
        console.error(error?.message || error)
        return res.status(500).json({ message: 'упс, неполадки!' })
    }
})

router.post('/update', async (req: any, res: any) => {
    let { username, info, age, gender } = req.body

    age = parseInt(age, 10)

    if (!(await checkLogin(username))) {
        return res.status(400).json({
            message:
                'Username не должен быть больше 30 символов и меньше 3. Без пробелов. -, _, #, /, разрешены',
        })
    }
    if (!(await checkInfo(info))) {
        return res
            .status(400)
            .json({ message: 'Info не должна превышать 250 символов' })
    }
    if (!(await checkAge(age))) {
        return res.status(400).json({ message: 'Разрешенный диапазон 1-120' })
    }
    if (!(await checkGender(gender))) {
        return res.status(400).json({ message: 'Invalid gender' })
    }
    console.log(username, info, age, gender)
    const token = req.cookies['aAuthToken']
    console.log(token)
    if (!token) {
        return res
            .status(500)
            .json({ message: 'Непредвиденная ошибка, обновите страницу' })
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
            console.log(userId)
            const result = await prisma.info.update({
                where: { userId: userId },
                data: {
                    info,
                    age,
                    gender,
                },
            })
            console.log(result)

            const result1 = await prisma.user.update({
                where: { id: userId },
                data: {
                    username,
                },
            })

            console.log(result1)
            if (!result1 || !result) {
                return res.status(500).json({ message: 'Ошибка изменения' })
            }
            console.log('hey')
            res.status(200).json({ message: 'Сохранено' })
        })
    } catch (error: any) {
        console.error(error?.message || error)
        return res.status(500).json({ message: 'упс, неполадки!' })
    }
})

export default router
