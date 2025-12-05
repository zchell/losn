import { NextRequest, NextResponse } from 'next/server';

const CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

const OBVIOUS_BOT_PATTERNS = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
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

export async function GET(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'Unknown';

    const isObviousBot = OBVIOUS_BOT_PATTERNS.some(pattern => pattern.test(userAgent));
    
    if (isObviousBot) {
        console.log(`[IP Check] Bot UA blocked: ${ip}, UA: ${userAgent.substring(0, 50)}`);
        return NextResponse.json({
            isSafe: false,
            ip: ip,
            reason: 'Bot user agent',
            checks: { bot: true }
        }, { headers: CACHE_HEADERS });
    }

    console.log(`[IP Check] Allowed: ${ip}`);
    return NextResponse.json({
        isSafe: true,
        ip: ip,
        checks: { bot: false }
    }, { headers: CACHE_HEADERS });
}
