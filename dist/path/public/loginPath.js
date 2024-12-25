import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const loginPath = join(__dirname, '../../../views', 'login.html');
export default loginPath;
