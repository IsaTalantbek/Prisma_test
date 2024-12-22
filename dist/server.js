import express from 'express'
import publicRouter from './routes/publicRouter.js'
import protectedRouter from './routes/protectedRouter.js'
import apiRouter from './routes/apiRouter.js'
import dotenv from 'dotenv'
import { authenticateToken } from './middleware/authMiddleware.js'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorMiddleware.js'
import errorPath from './path/errorPath.js'
import protectedPath from './path/protectedPath.js'
dotenv.config()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000

const app = express()
dotenv.config()
app.set('views', protectedPath)
app.set('view engine', 'ejs')
app.use(errorHandler)
app.use(express.json())
app.use(cookieParser())
app.use('/', publicRouter)
app.use('/a', authenticateToken, protectedRouter)
app.use('/api', apiRouter)

app.use((req, res) => {
    res.status(404).sendFile(errorPath)
})
app.listen(PORT, '0.0.0.0', () => {
    console.log('server started')
})
