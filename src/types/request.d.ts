export interface User {
    userId: number;
    ban: string;
    role: string;
    login: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
