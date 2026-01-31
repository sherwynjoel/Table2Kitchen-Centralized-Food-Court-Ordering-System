import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch all active orders (not completed)
        const activeOrders = await prisma.order.findMany({
            where: {
                status: { not: 'COMPLETED' }
            },
            include: {
                items: true,
                subOrders: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group by Table Number
        const tablesMap: { [key: string]: any } = {};

        activeOrders.forEach(order => {
            const table = order.tableNumber;
            if (!tablesMap[table]) {
                tablesMap[table] = {
                    tableNumber: table,
                    activeOrdersCount: 0,
                    totalAmount: 0,
                    startTime: order.createdAt, // Assumes oldest order is start time
                    itemsCount: 0,
                    status: 'Active' // Could be 'Payment Pending' etc.
                };
            }

            // Update table stats
            tablesMap[table].activeOrdersCount += 1;
            tablesMap[table].totalAmount += order.totalAmount;
            tablesMap[table].itemsCount += order.items.length;

            // Keep oldest time as start time
            if (new Date(order.createdAt) < new Date(tablesMap[table].startTime)) {
                tablesMap[table].startTime = order.createdAt;
            }
        });

        const tables = Object.values(tablesMap).sort((a: any, b: any) => parseInt(a.tableNumber) - parseInt(b.tableNumber));

        return NextResponse.json(tables);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch table stats' }, { status: 500 });
    }
}
