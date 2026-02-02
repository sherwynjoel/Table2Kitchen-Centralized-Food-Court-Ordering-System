import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // 1. Sales by Kitchen
        const kitchenSales = await prisma.subOrder.groupBy({
            by: ['kitchenId'],
            _count: { id: true },
            where: { status: { not: 'CANCELLED' } } // Assuming we track cancelled
        });

        // Enrich with Kitchen Names (Prisma groupBy doesn't support relation include directly)
        const kitchens = await prisma.kitchen.findMany();
        const salesByKitchen = kitchenSales.map(k => {
            const kitchen = kitchens.find(kit => kit.id === k.kitchenId);
            return {
                name: kitchen?.name || 'Unknown',
                orders: k._count.id
            };
        });

        // 2. Orders per Day (Last 7 Days)
        // Note: SQLite doesn't have powerful date functions, so we fetch last 7 days raw and group in JS
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            },
            select: { createdAt: true, totalAmount: true }
        });

        const salesByDayMap: { [key: string]: number } = {};
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            salesByDayMap[dateStr] = 0;
        }

        recentOrders.forEach(o => {
            const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
            if (salesByDayMap[dateStr] !== undefined) {
                salesByDayMap[dateStr] += o.totalAmount;
            }
        });

        const salesTrend = Object.keys(salesByDayMap).reverse().map(date => ({
            name: date,
            revenue: salesByDayMap[date]
        }));

        return NextResponse.json({
            salesByKitchen,
            salesTrend
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
