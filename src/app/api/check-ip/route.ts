import { NextRequest, NextResponse } from 'next/server';
import { checkIP } from '@/lib/ipCheck';
import { 
    checkUserAgentForBot, 
    checkHeadersForProxy, 
    isDatacenterASN,
    generateRequestFingerprint,
    checkRateLimit 
} from '@/lib/serverAntiBot';

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
            return NextResponse.json({
                isSafe: false,
                ip: ip,
                reason: 'Unknown/local IP - denying access for safety',
                checks: {
                    datacenter: true,
                    vpn: false,
                    tor: false,
                    proxy: false,
                    crawler: false,
                    bot: true,
                }
            });
        }

        const fingerprint = generateRequestFingerprint(ip, userAgent, acceptLanguage, acceptEncoding);
        const rateLimitCheck = checkRateLimit(fingerprint);
        
        if (rateLimitCheck.isRateLimited) {
            console.log(`[Anti-Bot] Rate limited: ${ip}, requests: ${rateLimitCheck.requestCount}`);
            return NextResponse.json({
                isSafe: false,
                ip: ip,
                reason: 'Rate limited - too many requests',
                checks: {
                    datacenter: false,
                    vpn: false,
                    tor: false,
                    proxy: false,
                    crawler: false,
                    bot: true,
                    rateLimited: true,
                }
            });
        }

        const uaCheck = checkUserAgentForBot(userAgent);
        
        if (uaCheck.isBot) {
            console.log(`[Anti-Bot] Bot detected via UA: ${ip}, type: ${uaCheck.botType}, reasons: ${uaCheck.reasons.join(', ')}`);
            return NextResponse.json({
                isSafe: false,
                ip: ip,
                reason: `Bot detected: ${uaCheck.botType || 'Unknown bot'}`,
                checks: {
                    datacenter: false,
                    vpn: false,
                    tor: false,
                    proxy: false,
                    crawler: uaCheck.isCrawler,
                    bot: true,
                    botType: uaCheck.botType,
                }
            });
        }

        const proxyCheck = checkHeadersForProxy(request.headers);
        
        if (proxyCheck.isProxy) {
            console.log(`[Anti-Bot] Proxy detected via headers: ${ip}, reasons: ${proxyCheck.reasons.join(', ')}`);
        }

        const apiKey = process.env.IPAPI_API_KEY;
        const securityCheck = await checkIP(ip, apiKey);

        if (securityCheck.asn && isDatacenterASN(securityCheck.asn)) {
            console.log(`[Anti-Bot] Datacenter ASN detected: ${ip}, ASN: ${securityCheck.asn.org}`);
            securityCheck.checks.datacenter.detected = true;
        }

        const isSafe = securityCheck.isSafe && !proxyCheck.isProxy;

        if (!isSafe) {
            const detectedThreats: string[] = [];
            if (securityCheck.checks.datacenter.detected) detectedThreats.push('datacenter');
            if (securityCheck.checks.vpn.detected) detectedThreats.push('vpn');
            if (securityCheck.checks.tor.detected) detectedThreats.push('tor');
            if (securityCheck.checks.proxy.detected) detectedThreats.push('proxy');
            if (securityCheck.checks.crawler.detected) detectedThreats.push('crawler');
            if (securityCheck.checks.abuser.detected) detectedThreats.push('abuser');
            if (proxyCheck.isProxy) detectedThreats.push('proxy-headers');
            
            console.log(`[Anti-Bot] Unsafe IP: ${ip}, threats: ${detectedThreats.join(', ')}`);
        }

        return NextResponse.json({
            isSafe: isSafe,
            ip: securityCheck.ip,
            checks: {
                datacenter: securityCheck.checks.datacenter.detected,
                vpn: securityCheck.checks.vpn.detected,
                tor: securityCheck.checks.tor.detected,
                proxy: securityCheck.checks.proxy.detected || proxyCheck.isProxy,
                crawler: securityCheck.checks.crawler.detected,
                bot: false,
                abuser: securityCheck.checks.abuser?.detected || false,
            },
            location: securityCheck.location,
            asn: securityCheck.asn,
        });
    } catch (error) {
        console.error('[Anti-Bot] IP check error:', error);
        return NextResponse.json({
            isSafe: false,
            ip: 'Unknown',
            reason: 'Error checking IP - denying access for safety',
            checks: {
                datacenter: true,
                vpn: false,
                tor: false,
                proxy: false,
                crawler: false,
                bot: false,
            }
        });
    }
}
