import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

export async function checkSecurity(req: Request) {
    // 1. Get User IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    let currentIp = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    currentIp = currentIp.trim();

    // 2. Allow Localhost (Testing)
    if (currentIp === '::1' || currentIp === '127.0.0.1') return 'OK';

    // 3. Check DB for Lock
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'ALLOWED_IP' }
        });
        const allowedIp = setting?.value;

        // If NO lock set, it is Open (OK)
        if (!allowedIp) return 'OK';

        // Match?
        if (allowedIp === currentIp) return 'OK';

        return 'BLOCK';
    } catch (e) {
        console.error("Security Check Failed DB", e);
        return 'OK'; // Fail open to prevent lockout if DB error? Or Fail Closed? 'OK' for MVP stability.
    }
}
