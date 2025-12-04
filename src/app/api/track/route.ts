import { NextRequest, NextResponse } from 'next/server';

interface TrackingData {
    event: string;
    userAgent?: string;
    screenResolution?: string;
    language?: string;
    platform?: string;
    timestamp?: string;
    referrer?: string;
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

        // Extract IP address from headers
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'Unknown';

        // Format message
        const message = formatMessage(data, ip);

        // Send to Discord and Telegram concurrently
        const promises = [];

        if (process.env.DISCORD_WEBHOOK_URL) {
            promises.push(sendToDiscord(message));
        }

        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            promises.push(sendToTelegram(message));
        }

        await Promise.allSettled(promises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tracking error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

function formatMessage(data: TrackingData, ip: string): string {
    const timestamp = new Date().toISOString();
    return `
🔔 **${data.event}**

📅 **Time:** ${timestamp}
🌐 **IP:** ${ip}
💻 **User Agent:** ${data.userAgent || 'Unknown'}
📱 **Platform:** ${data.platform || 'Unknown'}
🖥️ **Screen:** ${data.screenResolution || 'Unknown'}
🌍 **Language:** ${data.language || 'Unknown'}
🔗 **Referrer:** ${data.referrer || 'Direct'}
  `.trim();
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
    if (!token || !chatId) return;

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
    } catch (error) {
        console.error('Telegram API error:', error);
    }
}
