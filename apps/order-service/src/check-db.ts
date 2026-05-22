
import prisma from "../../../packages/libs/prisma/index.ts";

async function checkOrders() {
    console.log("--- Checking Database ---");
    try {
        const ordersCount = await prisma.orders.count();
        console.log(`Total Orders in DB: ${ordersCount}`);

        if (ordersCount > 0) {
            const lastOrders = await prisma.orders.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            });
            console.log("Last 5 Orders:");
            console.dir(lastOrders, { depth: null });
        } else {
            console.log("No orders found in the Orders collection.");
        }

        const itemsCount = await prisma.orderItems.count();
        console.log(`Total OrderItems in DB: ${itemsCount}`);

    } catch (error) {
        console.error("Database check failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkOrders();
