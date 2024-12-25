import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const protectedPath = join(__dirname, '../../views', 'protected');
export default protectedPath;
