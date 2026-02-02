const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listKitchens() {
    const kitchens = await prisma.kitchen.findMany();
    console.log('--- KITCHEN CREDENTIALS ---');
    kitchens.forEach(k => {
        console.log(`Kitchen: ${k.name}`);
        console.log(`Username: ${k.username}`);
        console.log(`Password: ${k.password}`);
        console.log('---------------------------');
    });
}
listKitchens();
