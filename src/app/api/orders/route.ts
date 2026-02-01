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
        const order = await prisma.$transaction(async (tx) => {
            // 1. Create the Main Order
            const newOrder = await tx.order.create({
                data: {
                    tableNumber: tableNumber.toString(),
                    totalAmount,
                    status: 'PENDING'
                }
            });

            const createdSubOrders = [];

            // 2. Create SubOrders and Items for each kitchen
            for (const kitchenIdStr of Object.keys(kitchenGroups)) {
                const kitchenId = parseInt(kitchenIdStr);
                const groupItems = kitchenGroups[kitchenId];

                // Create SubOrder
                const subOrder = await tx.subOrder.create({
                    data: {
                        kitchenId: kitchenId,
                        orderId: newOrder.id,
                        status: 'RECEIVED'
                    }
                });

                createdSubOrders.push(subOrder);

                // Create OrderItems linked to BOTH Order and SubOrder
                await tx.orderItem.createMany({
                    data: groupItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                        notes: item.notes || '',
                        orderId: newOrder.id,
                        subOrderId: subOrder.id
                    }))
                });
            }

            return newOrder;
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
