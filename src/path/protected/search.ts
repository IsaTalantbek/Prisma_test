import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const searchPath = join(
    __dirname,
    "../../../views",
    "protected",
    "search.html"
);

export default searchPath;
