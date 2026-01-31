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

    const updated = await prisma.subOrder.update({
        where: { id: subOrderId },
        data: { status }
    });

    // Note: Socket emission logic would ideally call the server here
    // For now, client triggers socket event after successful PATCH

    return NextResponse.json(updated);
}
