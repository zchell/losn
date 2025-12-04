import { NextRequest, NextResponse } from 'next/server';

interface BotCheckPayload {
  fingerprint: string;
  checks: Record<string, boolean>;
  score: number;
  behaviorMetrics: {
    mouseMovements: number;
    clicks: number;
    keyPresses: number;
    scrolls: number;
    timeOnPage: number;
    suspiciousPatterns: boolean;
  };
  timingCheckFailed: boolean;
  consoleOverridden: boolean;
  timestamp: number;
}

const KNOWN_BOT_FINGERPRINTS = new Set<string>();
const RATE_LIMIT_MAP = new Map<string, { count: number; firstRequest: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX = 10;

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    const ip = cfConnectingIP || forwardedFor?.split(',')[0]?.trim() || realIP || 'Unknown';

    const now = Date.now();
    const rateData = RATE_LIMIT_MAP.get(ip);
    
    if (rateData) {
      if (now - rateData.firstRequest < RATE_LIMIT_WINDOW) {
        if (rateData.count >= RATE_LIMIT_MAX) {
          return NextResponse.json({
            verified: false,
            reason: 'rate_limited',
            message: 'Too many verification attempts',
          }, { status: 429 });
        }
        rateData.count++;
      } else {
        RATE_LIMIT_MAP.set(ip, { count: 1, firstRequest: now });
      }
    } else {
      RATE_LIMIT_MAP.set(ip, { count: 1, firstRequest: now });
    }

    const payload: BotCheckPayload = await request.json();

    let threatScore = payload.score;

    if (payload.behaviorMetrics.suspiciousPatterns) {
      threatScore += 20;
    }

    if (payload.timingCheckFailed) {
      threatScore += 15;
    }

    if (payload.consoleOverridden) {
      threatScore += 10;
    }

    const timeOnPage = payload.behaviorMetrics.timeOnPage;
    if (timeOnPage < 500) {
      threatScore += 25;
    } else if (timeOnPage < 1000) {
      threatScore += 15;
    }

    if (payload.behaviorMetrics.mouseMovements === 0 && timeOnPage > 3000) {
      threatScore += 20;
    }

    if (KNOWN_BOT_FINGERPRINTS.has(payload.fingerprint)) {
      threatScore += 50;
    }

    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /go-http-client/i,
      /java\//i,
      /httpclient/i,
      /postman/i,
      /insomnia/i,
    ];

    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      threatScore += 40;
    }

    const isBot = threatScore >= 30;

    if (isBot && payload.fingerprint) {
      KNOWN_BOT_FINGERPRINTS.add(payload.fingerprint);
    }

    const detectedChecks: string[] = [];
    for (const [key, value] of Object.entries(payload.checks)) {
      if (value) detectedChecks.push(key);
    }

    console.log(`[Anti-Bot] IP: ${ip}, Score: ${threatScore}, Bot: ${isBot}, Checks: ${detectedChecks.join(', ') || 'none'}`);

    return NextResponse.json({
      verified: !isBot,
      threatScore,
      reason: isBot ? 'bot_detected' : 'human_verified',
      detectedChecks,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[Anti-Bot] Verification error:', error);
    return NextResponse.json({
      verified: false,
      reason: 'verification_error',
      message: 'Failed to verify request',
    }, { status: 500 });
  }
}
