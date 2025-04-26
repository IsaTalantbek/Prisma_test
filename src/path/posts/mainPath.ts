import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const mainPath = join(__dirname, "../../../views", "protected", "posts.html");

export default mainPath;
