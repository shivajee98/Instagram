const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const attempts = await prisma.loginAttempt.findMany({
            orderBy: {
                timestamp: 'desc'
            },
            take: 5
        });
        console.log('Latest login attempts:', attempts);
    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
