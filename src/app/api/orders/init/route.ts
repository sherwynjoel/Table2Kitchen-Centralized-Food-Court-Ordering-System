import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { tableNumber } = await req.json();

        if (!tableNumber) return NextResponse.json({ error: 'Missing table number' }, { status: 400 });

        // Check active session
        const existing = await prisma.order.findFirst({
            where: {
                tableNumber: tableNumber.toString(),
                status: { not: 'COMPLETED' }
            }
        });

        if (!existing) {
            // Mark table as Occupied
            await prisma.order.create({
                data: {
                    tableNumber: tableNumber.toString(),
                    status: 'OCCUPIED',
                    totalAmount: 0
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
