import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const createPostPath = join(
    __dirname,
    "../../../views",
    "protected",
    "createPost.html"
);

export default createPostPath;
