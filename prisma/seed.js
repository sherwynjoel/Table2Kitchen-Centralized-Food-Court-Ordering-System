const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    const k1 = await prisma.kitchen.upsert({
        where: { username: 'kitchenA' },
        update: {},
        create: {
            name: 'Burger Joint',
            username: 'kitchenA',
            password: 'password',
            products: {
                create: [
                    { name: 'Classic Cheeseburger', price: 10.99, description: 'Beef patty with cheddar', isAvailable: true, image: 'https://placehold.co/400x300?text=Burger' },
                    { name: 'Onion Rings', price: 4.50, description: 'Beer battered', isAvailable: true, image: 'https://placehold.co/400x300?text=Rings' },
                    { name: 'Milkshake', price: 5.00, description: 'Vanilla or Chocolate', isAvailable: true, image: 'https://placehold.co/400x300?text=Milkshake' }
                ]
            }
        },
    })

    const k2 = await prisma.kitchen.upsert({
        where: { username: 'kitchenB' },
        update: {},
        create: {
            name: 'Pizza Palace',
            username: 'kitchenB',
            password: 'password',
            products: {
                create: [
                    { name: 'Pepperoni Slice', price: 3.99, description: 'NY Style', isAvailable: true, image: 'https://placehold.co/400x300?text=Slice' },
                    { name: 'Whole Cheese Pizza', price: 18.00, description: 'Large 18 inch', isAvailable: true, image: 'https://placehold.co/400x300?text=Pizza' },
                    { name: 'Garlic Knots', price: 6.00, description: '6 pieces', isAvailable: true, image: 'https://placehold.co/400x300?text=Knots' }
                ]
            }
        },
    })

    const k3 = await prisma.kitchen.upsert({
        where: { username: 'kitchenC' },
        update: {},
        create: {
            name: 'Sushi Bar',
            username: 'kitchenC',
            password: 'password',
            products: {
                create: [
                    { name: 'California Roll', price: 8.50, description: 'Crab and avocado', isAvailable: true, image: 'https://placehold.co/400x300?text=Sushi' },
                    { name: 'Spicy Tuna Roll', price: 9.00, description: 'Fresh tuna', isAvailable: true, image: 'https://placehold.co/400x300?text=Tuna' },
                    { name: 'Miso Soup', price: 3.00, description: 'Hot soup', isAvailable: true, image: 'https://placehold.co/400x300?text=Soup' }
                ]
            }
        },
    })

    console.log(`Seeding finished. Created kitchens: ${k1.name}, ${k2.name}, ${k3.name}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
