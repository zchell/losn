import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'Unknown';

  const obviousBotPatterns = [
    /googlebot/i,
    /bingbot/i,
    /curl\//i,
    /wget\//i,
    /python-requests/i,
    /go-http-client/i,
    /headlesschrome/i,
    /phantomjs/i,
    /selenium/i,
    /puppeteer/i,
  ];

  const isObviousBot = obviousBotPatterns.some(pattern => pattern.test(userAgent));
  
  console.log(`[Verify] IP: ${ip}, Bot: ${isObviousBot}`);

  return NextResponse.json({
    verified: !isObviousBot,
    threatScore: isObviousBot ? 100 : 0,
    reason: isObviousBot ? 'bot_detected' : 'human_verified',
    timestamp: Date.now(),
  });
}
