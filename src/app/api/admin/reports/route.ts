import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const kitchens = await prisma.kitchen.findMany({
            include: {
                subOrders: {
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                        orderId: true,
                        order: {
                            select: { tableNumber: true }
                        },
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate Revenue and Details
        const report = kitchens.map(kitchen => {
            let totalRevenue = 0;

            const details = kitchen.subOrders.map(sub => {
                let subTotal = 0;
                const itemDescriptions = sub.items.map(item => {
                    const price = parseFloat(item.product.price.toString());
                    subTotal += price * item.quantity;
                    return `${item.quantity}x ${item.product.name}`;
                }).join(', ');

                totalRevenue += subTotal;

                return {
                    id: sub.id,
                    orderId: sub.orderId,
                    table: sub.order?.tableNumber ?? '?',
                    date: sub.createdAt,
                    items: itemDescriptions,
                    amount: subTotal
                };
            });

            return {
                id: kitchen.id,
                name: kitchen.name,
                totalOrders: kitchen.subOrders.length,
                totalRevenue: totalRevenue,
                details: details // Include detailed breakdown
            };
        });

        return NextResponse.json(report);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
