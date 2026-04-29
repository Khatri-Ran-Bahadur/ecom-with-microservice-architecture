import prisma from "@packages/libs/prisma"
import cron from "node-cron"

cron.schedule('0 * * * * *', () => {
    try {
        const now = new Date();
        //deleted producs where 'Deleted at is older than 24 hours
        prisma.products.deleteMany({
            where: {
                isDeleted: true,
                deletedAt: { lte: now },
            },
        });
    } catch (error) {
        console.log(error);

    }
});
