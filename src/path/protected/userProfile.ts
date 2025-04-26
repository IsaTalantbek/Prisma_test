import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const userProfilePath = join(__dirname, "../../../views", "userProfile.html");

export default userProfilePath;
