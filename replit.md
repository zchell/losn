# Next.js Download Landing Page

## Overview
This is a Next.js 16 web application that serves as a download landing page. It automatically detects the user's platform and initiates file downloads, with tracking capabilities via Discord webhooks and Telegram bot integration.

**Last Updated:** December 04, 2025

## Project Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Lucide React (icons)
- **Runtime:** Node.js

### Project Structure
```
/
├── src/
│   ├── app/
│   │   ├── api/track/route.ts    # Tracking API endpoint
│   │   ├── page.tsx              # Main landing page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   └── components/
│       ├── DownloadGuide.tsx     # Download notification component
│       └── PlatformModal.tsx     # Windows-only warning modal
├── public/                        # Static assets (logos, downloadable files)
├── next.config.ts                # Next.js configuration (configured for Replit)
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## Key Features

1. **Automatic Download Detection**
   - Detects user platform (Windows/non-Windows)
   - Auto-triggers download for Windows users
   - Shows warning modal for non-Windows users trying to download Windows-only files

2. **Analytics Tracking**
   - Tracks page visits, downloads, and user interactions
   - Sends events to Discord webhook and Telegram bot
   - Captures IP, user agent, platform, screen resolution, language, and referrer

3. **Visual Feedback**
   - Download guide notification with animation
   - Platform compatibility modal
   - SSA-themed branding and styling

## Configuration

### Environment Variables (Optional)
Create these environment variables for tracking functionality:
- `DISCORD_WEBHOOK_URL` - Discord webhook for event notifications
- `TELEGRAM_BOT_TOKEN` - Telegram bot token for notifications
- `TELEGRAM_CHAT_ID` - Telegram chat ID for notifications

Note: The app works without these variables, but tracking notifications won't be sent.

### Replit-Specific Configuration
The application is configured to work seamlessly with Replit's proxy environment:
- **Port:** 5000 (frontend, exposed for webview)
- **Host:** 0.0.0.0 (allows connections from Replit's proxy)
- **Next.js Config:** Uses default configuration - Next.js 16 with Turbopack automatically handles Replit's iframe proxy when the dev server binds to 0.0.0.0

## Development

### Running Locally
```bash
npm run dev
```
The app will be available at http://0.0.0.0:5000

### Building for Production
```bash
npm run build
npm start
```

## Deployment
This project is configured for Replit deployment with autoscale mode, suitable for stateless web applications.

## Recent Changes
- **2025-12-04:** Initial Replit setup
  - Configured package.json scripts to run Next.js dev server on port 5000 with 0.0.0.0 host binding
  - Improved tracking API to handle empty request bodies gracefully
  - Installed all npm dependencies (React 19, Next.js 16, Tailwind CSS 4, etc.)
  - Set up workflow for the development server with webview output on port 5000
  - Configured deployment with autoscale mode for production
