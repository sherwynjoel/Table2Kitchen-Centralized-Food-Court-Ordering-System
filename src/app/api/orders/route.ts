import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // In prod, use singleton pattern

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tableNumber, items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 });
        }

        // Group items by Kitchen
        const kitchenGroups: { [key: number]: any[] } = {};
        let totalAmount = 0;

        items.forEach((item: any) => {
            if (!kitchenGroups[item.kitchenId]) {
                kitchenGroups[item.kitchenId] = [];
            }
            kitchenGroups[item.kitchenId].push(item);
            totalAmount += item.price * item.quantity;
        });

        // Transaction: Create Order -> Create SubOrders -> Create OrderItems
        const order = await prisma.order.create({
            data: {
                tableNumber: tableNumber.toString(),
                totalAmount,
                status: 'PENDING',
                subOrders: {
                    create: Object.keys(kitchenGroups).map(kitchenId => ({
                        kitchenId: parseInt(kitchenId),
                        status: 'RECEIVED',
                        items: {
                            create: kitchenGroups[parseInt(kitchenId)].map(item => ({
                                productId: item.id,
                                quantity: item.quantity,
                                price: item.price,
                                notes: item.notes || ''
                                // Note: We need to link to Order as well, but nested create handles it conceptually
                            }))
                        }
                    }))
                },
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        notes: item.notes || ''
                    }))
                }
            },
            include: {
                subOrders: true
            }
        });

        // Notify Kitchens via Socket (Mock: In real app, emit to specific rooms)
        // This part would typically be handled by a separate event bus or by calling the socket server
        // For now, the client or a background worker can handle the socket emission upon success.

        return NextResponse.json(order);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
