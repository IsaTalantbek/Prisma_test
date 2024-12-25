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

// Применяешь публичный роутер
app.use('/a', authenticateToken, protectedRouter)
app.use('/', publicRouter)
app.use('/api', apiRouter)

app.use((req, res) => {
    res.status(404).sendFile(errorPath)
})

app.listen(PORT, '0.0.0.0', () => {
    console.log('server started')
})
