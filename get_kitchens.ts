const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Kitchen Credentials ---');
    const kitchens = await prisma.kitchen.findMany();
    if (kitchens.length === 0) {
        console.log("No kitchens found in database.");
    } else {
        kitchens.forEach((k: any) => {
            console.log(`Kitchen: ${k.name}`);
            console.log(`  Username: ${k.username}`);
            console.log(`  Password: ${k.password}`);
            console.log('-------------------------');
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
