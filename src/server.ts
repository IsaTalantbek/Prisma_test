import express, { Application } from 'express'
import publicRouter from './routes/publicRouter.ts'
import protectedRouter from './routes/protectedRouter.ts'
import apiRouter from './routes/apiRouter.ts'
import dotenv from 'dotenv'
import { authenticateToken } from './middleware/authMiddleware.ts'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorMiddleware.ts'
import path from 'path'
dotenv.config()

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000
const __dirname = path.resolve()

const app: Application = express()
dotenv.config()

app.set('views', path.join(__dirname, 'src', 'views', 'protected'))

app.set('view engine', 'ejs')

app.use(errorHandler)
app.use(express.json())
app.use(cookieParser())

// Применяешь публичный роутер
app.use('/', publicRouter)
app.use('/a', authenticateToken, protectedRouter)
app.use('/api', apiRouter)

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'src', 'views', 'error.html'))
})

app.listen(PORT, '0.0.0.0', () => {
    console.log('server started')
})
