import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const fetchDB = async ({ id, login, table }) => {
    try {
        if (!table) {
            table = 'user';
        }
        if (!id && !login) {
            if (table === 'info') {
                return await prisma.info.findMany();
            }
            return await prisma.user.findMany();
        }
        else if (id) {
            if (table === 'info') {
                return await prisma.info.findFirst({
                    where: { id: id },
                });
            }
            return await prisma.user.findFirst({
                where: { id: id },
            });
        }
        else if (login) {
            return await prisma.user.findFirst({
                where: { login: login },
            });
        }
        throw new Error('Invalid query parameters');
    }
    catch (error) {
        console.error(error.stack);
        throw error;
    }
};
export default fetchDB;
