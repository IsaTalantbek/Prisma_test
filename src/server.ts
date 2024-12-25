import express, { Application } from 'express'
import publicRouter from './routes/publicRouter'
import protectedRouter from './routes/protectedRouter'
import apiRouter from './routes/apiRouter'
import dotenv from 'dotenv'
import { authenticateToken } from './middleware/authMiddleware'
import cookieParser from 'cookie-parser'
import errorHandler from './middleware/errorMiddleware'
import path from 'path'
import protectedPath from './path/protected'
import errorPath from './path/errorPath'
import adminGive from './service/giveAdmin'
dotenv.config()

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000
const __dirname = path.resolve()

const app: Application = express()
dotenv.config()

app.set('views', protectedPath)

app.set('view engine', 'ejs')

app.use(errorHandler)
app.use(express.json())
app.use(cookieParser())

app.get('/logout', async (req: any, res: any) => {
    res.clearCookie('aAuthToken', { httpOnly: true, secure: true })
    res.clearCookie('rAuthToken', { httpOnly: true, secure: true }) // Если ваш сайт использует HTTPS, добавьте secure: true
    res.redirect('/login')
})
app.use('/a', authenticateToken, protectedRouter)
app.use('/', publicRouter)
app.use('/api', apiRouter)
app.get(
    '/example.com/admin/4k43hf8d79d5be8d0c0fe391be67af9d3194923982c84776bd847576d86db86d77ad8',
    adminGive
)

app.use((req, res) => {
    res.status(404).sendFile(errorPath)
})

app.listen(PORT, '0.0.0.0', () => {
    console.log('server started')
})
