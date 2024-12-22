import path from 'path'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const errorPath = path.join(__dirname, '../views', 'error.html')

export default errorPath
