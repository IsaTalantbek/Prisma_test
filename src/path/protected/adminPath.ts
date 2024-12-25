import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

const adminPath = join(__dirname, '../../../views', 'admin.html')

export default adminPath
