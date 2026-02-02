import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkSecurity } from '@/lib/security';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

// Get all kitchens
export async function GET(req: Request) {
    if (await checkSecurity(req) === 'BLOCK') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    try {
        const kitchens = await prisma.kitchen.findMany({
            include: {
                _count: { select: { subOrders: true } }
            }
        });
        return NextResponse.json(kitchens);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch kitchens' }, { status: 500 });
    }
}

// Create new kitchen
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, username, password } = body;

        const kitchen = await prisma.kitchen.create({
            data: { name, username, password }
        });

        return NextResponse.json(kitchen);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create kitchen' }, { status: 500 });
    }
}

// Update kitchen (Password or Status)
export async function PATCH(req: Request) {
    if (await checkSecurity(req) === 'BLOCK') return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    try {
        const body = await req.json();
        const { id, password, isActive } = body;

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const data: any = {};
        if (password) data.password = password;
        if (isActive !== undefined) data.isActive = isActive;

        const updated = await prisma.kitchen.update({
            where: { id: parseInt(id) },
            data: data
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update kitchen' }, { status: 500 });
    }
}

// Delete kitchen
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await prisma.kitchen.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete kitchen' }, { status: 500 });
    }
}
