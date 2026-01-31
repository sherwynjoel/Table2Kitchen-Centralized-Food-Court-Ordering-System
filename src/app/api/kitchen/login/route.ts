import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const kitchen = await prisma.kitchen.findUnique({
            where: { username }
        });

        if (kitchen && kitchen.password === password) {
            // In a real app, set a HttpOnly cookie token.
            // For simplicity, we return the ID to store in LocalStorage.
            return NextResponse.json({ id: kitchen.id, name: kitchen.name });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
