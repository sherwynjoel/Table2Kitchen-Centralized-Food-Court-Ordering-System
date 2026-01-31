import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                subOrders: {
                    include: {
                        kitchen: { select: { name: true } }
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
