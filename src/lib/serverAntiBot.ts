export interface ServerBotCheckResult {
  isBot: boolean;
  isCrawler: boolean;
  isDatacenter: boolean;
  botType: string | null;
  userAgent: string;
  reasons: string[];
}

const BOT_USER_AGENTS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /sogou/i,
  /exabot/i,
  /facebot/i,
  /facebookexternalhit/i,
  /facebook/i,
  /ia_archiver/i,
  /telegrambot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterest/i,
  /redditbot/i,
  /slackbot/i,
  /discordbot/i,
  /whatsapp/i,
  /snapchat/i,
  /viber/i,
  /skype/i,
  /line/i,
  /kakaotalk/i,
  /wechat/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /bytedance/i,
  /tiktok/i,
  /amazonbot/i,
  /yeti/i,
  /naverbot/i,
  /seznambot/i,
  /ccbot/i,
  /gptbot/i,
  /chatgpt/i,
  /anthropic/i,
  /claude/i,
  /cohere/i,
  /perplexity/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /bot\b/i,
  /crawl/i,
  /archive/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /python-urllib/i,
  /python/i,
  /java\//i,
  /httpclient/i,
  /apache-httpclient/i,
  /okhttp/i,
  /go-http-client/i,
  /node-fetch/i,
  /axios/i,
  /request\//i,
  /libwww/i,
  /lwp/i,
  /php\//i,
  /ruby/i,
  /perl/i,
  /mechanize/i,
  /scrapy/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /headless/i,
  /phantomjs/i,
  /chrome-lighthouse/i,
  /lighthouse/i,
  /pagespeed/i,
  /gtmetrix/i,
  /pingdom/i,
  /uptimerobot/i,
  /statuscake/i,
  /monitis/i,
  /site24x7/i,
  /newrelic/i,
  /datadog/i,
  /dynatrace/i,
  /appdynamics/i,
  /cloudflare/i,
  /akamai/i,
  /fastly/i,
  /imperva/i,
  /sucuri/i,
  /barracuda/i,
  /fortinet/i,
  /paloalto/i,
  /zscaler/i,
  /netcraft/i,
  /qualys/i,
  /tenable/i,
  /rapid7/i,
  /nessus/i,
  /nmap/i,
  /masscan/i,
  /shodan/i,
  /censys/i,
  /zoomeye/i,
  /binaryedge/i,
  /securitytrails/i,
  /virustotal/i,
  /urlscan/i,
  /hybrid-analysis/i,
  /any\.run/i,
  /joesandbox/i,
  /cuckoo/i,
  /postman/i,
  /insomnia/i,
  /httpie/i,
  /rest-client/i,
  /paw\//i,
  /soapui/i,
  /jmeter/i,
  /loadrunner/i,
  /gatling/i,
  /locust/i,
  /ab\//i,
  /siege/i,
  /wrk/i,
  /vegeta/i,
  /hey\//i,
  /autocomplete/i,
  /preview/i,
  /link/i,
  /embed/i,
  /fetch/i,
  /proxy/i,
  /scan/i,
  /check/i,
  /test/i,
  /monitor/i,
  /health/i,
  /status/i,
  /probe/i,
  /validator/i,
  /analyzer/i,
  /inspector/i,
  /diagnos/i,
];

const BOT_TYPE_MAP: { pattern: RegExp; type: string }[] = [
  { pattern: /googlebot/i, type: 'Google Bot' },
  { pattern: /bingbot/i, type: 'Bing Bot' },
  { pattern: /telegrambot/i, type: 'Telegram Bot' },
  { pattern: /facebot|facebookexternalhit|facebook/i, type: 'Facebook Bot' },
  { pattern: /twitterbot/i, type: 'Twitter Bot' },
  { pattern: /linkedinbot/i, type: 'LinkedIn Bot' },
  { pattern: /pinterest/i, type: 'Pinterest Bot' },
  { pattern: /discordbot/i, type: 'Discord Bot' },
  { pattern: /slackbot/i, type: 'Slack Bot' },
  { pattern: /whatsapp/i, type: 'WhatsApp Bot' },
  { pattern: /snapchat/i, type: 'Snapchat Bot' },
  { pattern: /tiktok|bytedance|bytespider/i, type: 'TikTok/ByteDance Bot' },
  { pattern: /applebot/i, type: 'Apple Bot' },
  { pattern: /amazonbot/i, type: 'Amazon Bot' },
  { pattern: /gptbot|chatgpt|openai/i, type: 'OpenAI/GPT Bot' },
  { pattern: /anthropic|claude/i, type: 'Anthropic/Claude Bot' },
  { pattern: /semrushbot/i, type: 'SEMrush Bot' },
  { pattern: /ahrefsbot/i, type: 'Ahrefs Bot' },
  { pattern: /python|scrapy/i, type: 'Python Scraper' },
  { pattern: /selenium|puppeteer|playwright|phantomjs/i, type: 'Automation Tool' },
  { pattern: /curl|wget/i, type: 'CLI Tool' },
  { pattern: /postman|insomnia/i, type: 'API Testing Tool' },
  { pattern: /headless/i, type: 'Headless Browser' },
  { pattern: /crawler|spider|scraper/i, type: 'Web Crawler' },
  { pattern: /bot\b/i, type: 'Generic Bot' },
];

const DATACENTER_ASN_KEYWORDS = [
  'amazon',
  'aws',
  'google',
  'gcp',
  'microsoft',
  'azure',
  'digitalocean',
  'linode',
  'vultr',
  'ovh',
  'hetzner',
  'scaleway',
  'contabo',
  'hostinger',
  'godaddy',
  'namecheap',
  'cloudflare',
  'fastly',
  'akamai',
  'leaseweb',
  'softlayer',
  'rackspace',
  'oracle',
  'alibaba',
  'tencent',
  'huawei',
  'baidu',
  'yandex',
  'mail.ru',
  'vk',
  'hosting',
  'server',
  'datacenter',
  'data center',
  'cloud',
  'vps',
  'dedicated',
  'colocation',
  'colo',
  'isp',
  'telecom',
  'backbone',
  'transit',
  'peering',
  'ix',
  'exchange',
];

const SUSPICIOUS_HEADERS = [
  'x-proxy-id',
  'x-bluecoat-via',
  'x-routed',
  'x-originating-ip',
];

export function checkUserAgentForBot(userAgent: string): ServerBotCheckResult {
  const ua = userAgent || '';
  const reasons: string[] = [];
  let isBot = false;
  let isCrawler = false;
  let botType: string | null = null;

  if (!ua || ua.length < 10) {
    isBot = true;
    reasons.push('Missing or too short user agent');
  }

  for (const pattern of BOT_USER_AGENTS) {
    if (pattern.test(ua)) {
      isBot = true;
      isCrawler = true;
      reasons.push(`Matched bot pattern: ${pattern.source}`);
      break;
    }
  }

  for (const { pattern, type } of BOT_TYPE_MAP) {
    if (pattern.test(ua)) {
      botType = type;
      break;
    }
  }

  if (!isBot) {
    const browserIndicators = [
      /mozilla/i,
      /chrome/i,
      /safari/i,
      /firefox/i,
      /edge/i,
      /opera/i,
    ];
    
    const hasBrowserIndicator = browserIndicators.some(p => p.test(ua));
    
    if (!hasBrowserIndicator) {
      isBot = true;
      reasons.push('No browser indicators found');
    }
  }

  if (!isBot) {
    const suspiciousPatterns = [
      /^Mozilla\/4\.0$/,
      /^Mozilla\/5\.0$/,
      /^Mozilla\/5\.0 \(compatible\)$/,
      /^Mozilla\/5\.0 \(Windows\)$/,
      /MSIE [1-6]\./,
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(ua)) {
        isBot = true;
        reasons.push(`Suspicious user agent pattern: ${pattern.source}`);
        break;
      }
    }
  }

  return {
    isBot,
    isCrawler,
    isDatacenter: false,
    botType,
    userAgent: ua,
    reasons,
  };
}

export function checkHeadersForProxy(headers: Headers): { isProxy: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let isProxy = false;

  let proxyHeaderCount = 0;
  for (const header of SUSPICIOUS_HEADERS) {
    if (headers.get(header)) {
      proxyHeaderCount++;
      reasons.push(`Suspicious header: ${header}`);
    }
  }

  if (proxyHeaderCount >= 2) {
    isProxy = true;
  }

  const via = headers.get('via');
  if (via && /proxy|anonymizer|tunnel/i.test(via)) {
    isProxy = true;
    reasons.push('Via header indicates proxy');
  }

  return { isProxy, reasons };
}

export function isDatacenterASN(asnInfo: { org?: string; type?: string }): boolean {
  if (!asnInfo) return false;
  
  const org = (asnInfo.org || '').toLowerCase();
  const type = (asnInfo.type || '').toLowerCase();
  
  if (type === 'hosting' || type === 'datacenter') {
    return true;
  }
  
  const strictDatacenterKeywords = [
    'amazon', 'aws', 'google cloud', 'gcp', 'microsoft azure', 'azure',
    'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner', 'scaleway',
    'contabo', 'leaseweb', 'softlayer', 'rackspace', 'oracle cloud',
    'alibaba cloud', 'tencent cloud', 'huawei cloud'
  ];
  
  for (const keyword of strictDatacenterKeywords) {
    if (org.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

export function generateRequestFingerprint(
  ip: string,
  userAgent: string,
  acceptLanguage: string,
  acceptEncoding: string
): string {
  const components = [
    ip,
    userAgent,
    acceptLanguage || 'none',
    acceptEncoding || 'none',
  ];
  
  const raw = components.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

const REQUEST_TRACKING = new Map<string, { count: number; firstSeen: number; lastSeen: number }>();
const RATE_LIMIT_WINDOW = 60000;
const RATE_LIMIT_MAX_REQUESTS = 30;

export function checkRateLimit(fingerprint: string): { isRateLimited: boolean; requestCount: number } {
  const now = Date.now();
  const tracking = REQUEST_TRACKING.get(fingerprint);
  
  if (!tracking) {
    REQUEST_TRACKING.set(fingerprint, { count: 1, firstSeen: now, lastSeen: now });
    return { isRateLimited: false, requestCount: 1 };
  }
  
  if (now - tracking.firstSeen > RATE_LIMIT_WINDOW) {
    REQUEST_TRACKING.set(fingerprint, { count: 1, firstSeen: now, lastSeen: now });
    return { isRateLimited: false, requestCount: 1 };
  }
  
  tracking.count++;
  tracking.lastSeen = now;
  
  if (tracking.count > RATE_LIMIT_MAX_REQUESTS) {
    return { isRateLimited: true, requestCount: tracking.count };
  }
  
  return { isRateLimited: false, requestCount: tracking.count };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of REQUEST_TRACKING.entries()) {
    if (now - value.lastSeen > RATE_LIMIT_WINDOW * 2) {
      REQUEST_TRACKING.delete(key);
    }
  }
}, 60000);
