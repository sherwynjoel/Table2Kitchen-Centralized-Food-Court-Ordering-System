import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Product
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, price, description, kitchenId, isAvailable, image } = body;

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                kitchenId: parseInt(kitchenId),
                isAvailable: isAvailable ?? true,
                image: image || '/placeholder.png'
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// Update Product
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;

        if (data.price) data.price = parseFloat(data.price);
        if (data.kitchenId) data.kitchenId = parseInt(data.kitchenId);

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// Delete Product
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
