import { NextRequest, NextResponse } from 'next/server';
import { checkIP } from '@/lib/ipCheck';

const CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

function getClientIP(request: NextRequest): string {
    const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    const ip = vercelForwardedFor?.split(',')[0]?.trim() ||
               cfConnectingIP ||
               forwardedFor?.split(',')[0]?.trim() ||
               realIP ||
               'Unknown';
    
    return ip;
}

export async function GET(request: NextRequest) {
    try {
        const ip = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';

        console.log(`[IP Check] Checking IP: ${ip}, UA: ${userAgent.substring(0, 50)}...`);

        if (ip === 'Unknown' || ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('::')) {
            console.log(`[IP Check] Local/unknown IP, failing open: ${ip}`);
            return NextResponse.json({
                isSafe: true,
                ip: ip,
                reason: 'Local/unknown IP - allowing access',
                checks: {
                    datacenter: false,
                    vpn: false,
                    tor: false,
                    proxy: false,
                    crawler: false,
                    bot: false,
                }
            }, { headers: CACHE_HEADERS });
        }

        const knownBotPatterns = [
            /googlebot/i,
            /bingbot/i,
            /slurp/i,
            /duckduckbot/i,
            /baiduspider/i,
            /yandexbot/i,
            /facebot/i,
            /facebookexternalhit/i,
            /twitterbot/i,
            /linkedinbot/i,
            /telegrambot/i,
            /discordbot/i,
            /curl\//i,
            /wget\//i,
            /python-requests/i,
            /python-urllib/i,
            /go-http-client/i,
            /java\//i,
            /httpclient/i,
            /headlesschrome/i,
            /phantomjs/i,
            /selenium/i,
            /puppeteer/i,
            /playwright/i,
        ];
        
        const isKnownBot = knownBotPatterns.some(pattern => pattern.test(userAgent));
        
        if (isKnownBot) {
            console.log(`[IP Check] Known bot UA detected: ${ip}`);
            return NextResponse.json({
                isSafe: false,
                ip: ip,
                reason: 'Known bot user agent',
                checks: {
                    datacenter: false,
                    vpn: false,
                    tor: false,
                    proxy: false,
                    crawler: true,
                    bot: true,
                }
            }, { headers: CACHE_HEADERS });
        }

        const apiKey = process.env.IPAPI_API_KEY;
        const securityCheck = await checkIP(ip, apiKey);

        if (securityCheck.apiError) {
            console.log(`[IP Check] API error, failing open: ${ip}`);
            return NextResponse.json({
                isSafe: true,
                ip: ip,
                reason: 'IP API error - allowing access',
                checks: {
                    datacenter: false,
                    vpn: false,
                    tor: false,
                    proxy: false,
                    crawler: false,
                    bot: false,
                },
                apiError: true,
            }, { headers: CACHE_HEADERS });
        }

        const isVPN = securityCheck.checks.vpn.detected;
        const isTor = securityCheck.checks.tor.detected;
        const isDatacenter = securityCheck.checks.datacenter.detected;
        
        const isSafe = !isVPN && !isTor && !isDatacenter;

        console.log(`[IP Check] Result for ${ip}: safe=${isSafe}, vpn=${isVPN}, tor=${isTor}, dc=${isDatacenter}`);

        return NextResponse.json({
            isSafe: isSafe,
            ip: securityCheck.ip,
            checks: {
                datacenter: isDatacenter,
                vpn: isVPN,
                tor: isTor,
                proxy: securityCheck.checks.proxy.detected,
                crawler: securityCheck.checks.crawler.detected,
                bot: false,
            },
            location: securityCheck.location,
            asn: securityCheck.asn,
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        console.error('[IP Check] Error - failing open:', error);
        return NextResponse.json({
            isSafe: true,
            ip: 'Unknown',
            reason: 'Error checking IP - allowing access',
            checks: {
                datacenter: false,
                vpn: false,
                tor: false,
                proxy: false,
                crawler: false,
                bot: false,
            },
            apiError: true,
        }, { headers: CACHE_HEADERS });
    }
}
