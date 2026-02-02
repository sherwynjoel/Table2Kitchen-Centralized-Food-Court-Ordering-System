import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get products for a specific kitchen
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const kitchenId = searchParams.get('id');

    if (!kitchenId) return NextResponse.json({ error: 'Kitchen ID required' }, { status: 400 });

    const products = await prisma.product.findMany({
        where: { kitchenId: parseInt(kitchenId) }
    });
    return NextResponse.json(products);
}

// Toggle availability
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { productId, isAvailable } = body;

        const updated = await prisma.product.update({
            where: { id: productId },
            data: { isAvailable }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
