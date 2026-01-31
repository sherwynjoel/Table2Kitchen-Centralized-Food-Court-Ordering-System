const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Debugging DB ---');
    const orders = await prisma.order.findMany({
        include: { items: true, subOrders: true }
    });
    console.log(`Total Orders: ${orders.length}`);
    orders.forEach((o: any) => {
        console.log(`Order #${o.id} - Table: ${o.tableNumber} - Status: ${o.status}`);
        console.log(`  Items: ${o.items.length}`);
        console.log(`  SubOrders: ${o.subOrders.length}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
