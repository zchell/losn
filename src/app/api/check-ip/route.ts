import { NextRequest, NextResponse } from 'next/server';
import { checkIP, SecurityCheckResult } from '@/lib/ipCheck';

export async function GET(request: NextRequest) {
    try {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const ip = forwardedFor?.split(',')[0]?.trim() || realIP || 'Unknown';

        if (ip === 'Unknown' || ip === '127.0.0.1' || ip === 'localhost') {
            return NextResponse.json({
                isSafe: true,
                ip: ip,
                reason: 'Local/unknown IP - allowing access'
            });
        }

        const apiKey = process.env.IPAPI_API_KEY;
        const securityCheck = await checkIP(ip, apiKey);

        return NextResponse.json({
            isSafe: securityCheck.isSafe,
            ip: securityCheck.ip,
            checks: {
                datacenter: securityCheck.checks.datacenter.detected,
                vpn: securityCheck.checks.vpn.detected,
                tor: securityCheck.checks.tor.detected,
                proxy: securityCheck.checks.proxy.detected,
                crawler: securityCheck.checks.crawler.detected,
            }
        });
    } catch (error) {
        console.error('IP check error:', error);
        return NextResponse.json({
            isSafe: true,
            ip: 'Unknown',
            reason: 'Error checking IP - allowing access'
        });
    }
}
