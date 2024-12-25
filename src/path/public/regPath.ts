import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const regPath = join(__dirname, '../../../views', 'reg.html')

export default regPath
