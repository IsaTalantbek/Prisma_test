import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const errorPath = join(__dirname, '../../views', 'error.html')

export default errorPath