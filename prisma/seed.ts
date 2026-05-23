import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';
import { services } from '../data/services';
const prisma = new PrismaClient();

async function main() {
    await prisma.services.deleteMany();

    await prisma.services.createMany({ data: services });
}

main()
    .catch((e) => {
        logger.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
