import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [totalOrders, totalRevenue, activeKitchens] = await Promise.all([
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: { totalAmount: true }
            }),
            prisma.kitchen.count()
        ]);

        return NextResponse.json({
            orders: totalOrders,
            revenue: totalRevenue._sum.totalAmount || 0,
            kitchens: activeKitchens
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
