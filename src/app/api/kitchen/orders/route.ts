import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const kitchenId = searchParams.get('id');

    if (!kitchenId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const subOrders = await prisma.subOrder.findMany({
        where: {
            kitchenId: parseInt(kitchenId),
            status: { not: 'SERVED' } // Hide completed orders
        },
        include: {
            order: { select: { tableNumber: true } },
            items: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(subOrders);
}

export async function PATCH(req: Request) {
    const body = await req.json();
    const { subOrderId, status } = body;

    // 1. Update the SubOrder
    const updatedSubOrder = await prisma.subOrder.update({
        where: { id: subOrderId },
        data: { status },
        include: { order: true }
    });

    // 2. Check Parent Order Status
    const orderId = updatedSubOrder.orderId;

    // Fetch all siblings
    const allSubOrders = await prisma.subOrder.findMany({
        where: { orderId: orderId }
    });

    // Determine new status
    // Logic: If ALL suborders are SERVED -> COMPLETED
    // If ANY is PREPARING/READY/SERVED -> IN_PROGRESS
    // Else -> PENDING

    const allServed = allSubOrders.every(sub => sub.status === 'SERVED');
    const anyActive = allSubOrders.some(sub => sub.status !== 'PENDING');

    let newOrderStatus = 'PENDING';
    if (allServed) {
        newOrderStatus = 'COMPLETED';
    } else if (anyActive) {
        newOrderStatus = 'IN_PROGRESS'; // Or 'PREPARING' depending on desired text
    }

    // Only update if different
    if (updatedSubOrder.order.status !== newOrderStatus) {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newOrderStatus }
        });
        console.log(`Order #${orderId} status updated to ${newOrderStatus}`);
    }

    return NextResponse.json(updatedSubOrder);
}
