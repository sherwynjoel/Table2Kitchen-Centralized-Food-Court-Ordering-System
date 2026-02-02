import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust import based on your project structure

const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'admin123';

export async function GET(req: Request) {
    // 1. Get Current IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    let currentIp = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

    // Clean IP
    currentIp = currentIp.trim();

    // 2. Get Allowed IP from DB
    const setting = await prisma.systemSetting.findUnique({
        where: { key: 'ALLOWED_IP' }
    });

    return NextResponse.json({
        allowedIp: setting?.value || null, // If null, no restriction
        currentIp,
        isMatch: !setting?.value || setting.value === currentIp
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { password, ip } = body;

        // 1. Verify Master Password
        if (password !== MASTER_PASSWORD) {
            return NextResponse.json({ error: 'Invalid Master Password' }, { status: 401 });
        }

        if (!ip) return NextResponse.json({ error: 'Missing IP' }, { status: 400 });

        // 2. Update DB
        await prisma.systemSetting.upsert({
            where: { key: 'ALLOWED_IP' },
            update: { value: ip },
            create: { key: 'ALLOWED_IP', value: ip }
        });

        return NextResponse.json({ success: true, newIp: ip });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
