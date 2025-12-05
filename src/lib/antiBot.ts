export interface BotDetectionResult {
  isBot: boolean;
  score: number;
  checks: {
    webdriver: boolean;
    headless: boolean;
    phantomjs: boolean;
    selenium: boolean;
    puppeteer: boolean;
    playwright: boolean;
    automation: boolean;
    languages: boolean;
    plugins: boolean;
    webgl: boolean;
    canvas: boolean;
    permissions: boolean;
    timing: boolean;
    touchSupport: boolean;
    screenResolution: boolean;
  };
  fingerprint: string;
  timestamp: number;
}

export function detectBot(): BotDetectionResult {
  const checks = {
    webdriver: false,
    headless: false,
    phantomjs: false,
    selenium: false,
    puppeteer: false,
    playwright: false,
    automation: false,
    languages: false,
    plugins: false,
    webgl: false,
    canvas: false,
    permissions: false,
    timing: false,
    touchSupport: false,
    screenResolution: false,
  };

  let botScore = 0;

  if (typeof window === 'undefined') {
    return {
      isBot: true,
      score: 100,
      checks,
      fingerprint: 'server-side',
      timestamp: Date.now(),
    };
  }

  const nav = navigator as Navigator & {
    webdriver?: boolean;
    __webdriver_script_fn?: unknown;
    __driver_evaluate?: unknown;
    __webdriver_evaluate?: unknown;
    __selenium_evaluate?: unknown;
    __fxdriver_evaluate?: unknown;
    __driver_unwrapped?: unknown;
    __webdriver_unwrapped?: unknown;
    __driver_script_fn?: unknown;
    __selenium_unwrapped?: unknown;
    __fxdriver_unwrapped?: unknown;
    callPhantom?: unknown;
    _phantom?: unknown;
    phantom?: unknown;
    domAutomation?: unknown;
    domAutomationController?: unknown;
  };

  const win = window as Window & {
    callPhantom?: unknown;
    _phantom?: unknown;
    phantom?: unknown;
    __nightmare?: unknown;
    _selenium?: unknown;
    __webdriver_script_fn?: unknown;
    __driver_evaluate?: unknown;
    __webdriver_evaluate?: unknown;
    __selenium_evaluate?: unknown;
    __fxdriver_evaluate?: unknown;
    __driver_unwrapped?: unknown;
    __webdriver_unwrapped?: unknown;
    __selenium_unwrapped?: unknown;
    __fxdriver_unwrapped?: unknown;
    domAutomation?: unknown;
    domAutomationController?: unknown;
    _Selenium_IDE_Recorder?: unknown;
    _WEBDRIVER_ELEM_CACHE?: unknown;
    ChromeDriverw?: unknown;
    __$webdriverAsyncExecutor?: unknown;
    webdriver?: unknown;
    __lastWatirAlert?: unknown;
    __lastWatirConfirm?: unknown;
    __lastWatirPrompt?: unknown;
    _WEBDRIVER_ELEM_CACHE_INJECT_JS?: unknown;
    cdc_adoQpoasnfa76pfcZLmcfl_Array?: unknown;
    cdc_adoQpoasnfa76pfcZLmcfl_Promise?: unknown;
    cdc_adoQpoasnfa76pfcZLmcfl_Symbol?: unknown;
    playwright?: unknown;
    __playwright?: unknown;
    __pw_manual?: unknown;
  };

  const doc = document as Document & {
    __webdriver_script_fn?: unknown;
    __driver_evaluate?: unknown;
    __webdriver_evaluate?: unknown;
    __selenium_evaluate?: unknown;
    __fxdriver_evaluate?: unknown;
    __driver_unwrapped?: unknown;
    __webdriver_unwrapped?: unknown;
    __selenium_unwrapped?: unknown;
    __fxdriver_unwrapped?: unknown;
    $cdc_asdjflasutopfhvcZLmcfl_?: unknown;
    $chrome_asyncScriptInfo?: unknown;
    __$webdriverAsyncExecutor?: unknown;
  };

  if (nav.webdriver) {
    checks.webdriver = true;
    botScore += 30;
  }

  const headlessIndicators = [
    nav.userAgent?.includes('HeadlessChrome'),
    nav.userAgent?.includes('Headless'),
    nav.plugins?.length === 0,
    !nav.languages || nav.languages.length === 0,
    win.outerWidth === 0,
    win.outerHeight === 0,
    nav.hardwareConcurrency === 0,
    (nav as Navigator & { deviceMemory?: number }).deviceMemory === 0,
  ];

  if (headlessIndicators.filter(Boolean).length >= 2) {
    checks.headless = true;
    botScore += 25;
  }

  const phantomIndicators = [
    win.callPhantom !== undefined,
    win._phantom !== undefined,
    win.phantom !== undefined,
    nav.callPhantom !== undefined,
    nav._phantom !== undefined,
    nav.phantom !== undefined,
  ];

  if (phantomIndicators.some(Boolean)) {
    checks.phantomjs = true;
    botScore += 30;
  }

  const seleniumIndicators = [
    win._selenium !== undefined,
    win._Selenium_IDE_Recorder !== undefined,
    win._WEBDRIVER_ELEM_CACHE !== undefined,
    doc.__selenium_evaluate !== undefined,
    doc.__selenium_unwrapped !== undefined,
    win.__selenium_evaluate !== undefined,
    win.__selenium_unwrapped !== undefined,
    nav.__selenium_evaluate !== undefined,
    nav.__selenium_unwrapped !== undefined,
  ];

  if (seleniumIndicators.some(Boolean)) {
    checks.selenium = true;
    botScore += 30;
  }

  const puppeteerIndicators = [
    nav.__webdriver_script_fn !== undefined,
    nav.__driver_evaluate !== undefined,
    nav.__webdriver_evaluate !== undefined,
    nav.__driver_unwrapped !== undefined,
    nav.__webdriver_unwrapped !== undefined,
    win.__webdriver_script_fn !== undefined,
    win.__driver_evaluate !== undefined,
    win.__webdriver_evaluate !== undefined,
    doc.$cdc_asdjflasutopfhvcZLmcfl_ !== undefined,
    win.cdc_adoQpoasnfa76pfcZLmcfl_Array !== undefined,
    win.cdc_adoQpoasnfa76pfcZLmcfl_Promise !== undefined,
    win.cdc_adoQpoasnfa76pfcZLmcfl_Symbol !== undefined,
  ];

  if (puppeteerIndicators.some(Boolean)) {
    checks.puppeteer = true;
    botScore += 30;
  }

  const playwrightIndicators = [
    win.playwright !== undefined,
    win.__playwright !== undefined,
    win.__pw_manual !== undefined,
  ];

  if (playwrightIndicators.some(Boolean)) {
    checks.playwright = true;
    botScore += 30;
  }

  const automationIndicators = [
    nav.domAutomation !== undefined,
    nav.domAutomationController !== undefined,
    win.domAutomation !== undefined,
    win.domAutomationController !== undefined,
    win.__nightmare !== undefined,
    win.webdriver !== undefined,
    win.__lastWatirAlert !== undefined,
    win.__lastWatirConfirm !== undefined,
    win.__lastWatirPrompt !== undefined,
    win.ChromeDriverw !== undefined,
    win.__$webdriverAsyncExecutor !== undefined,
    doc.__$webdriverAsyncExecutor !== undefined,
    win._WEBDRIVER_ELEM_CACHE_INJECT_JS !== undefined,
  ];

  if (automationIndicators.some(Boolean)) {
    checks.automation = true;
    botScore += 25;
  }

  if (!nav.languages || nav.languages.length === 0) {
    checks.languages = true;
    botScore += 10;
  }

  if (!nav.plugins || nav.plugins.length === 0) {
    const isChrome = nav.userAgent?.includes('Chrome');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(nav.userAgent || '');
    if (isChrome && !isMobile) {
      checks.plugins = true;
      botScore += 15;
    }
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      checks.webgl = true;
      botScore += 10;
    } else {
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer?.includes('SwiftShader') || renderer?.includes('llvmpipe')) {
          checks.webgl = true;
          botScore += 15;
        }
      }
    }
  } catch {
    checks.webgl = true;
    botScore += 5;
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Bot detection test!', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Bot detection test!', 4, 17);
      
      const dataUrl = canvas.toDataURL();
      if (dataUrl === 'data:,' || dataUrl.length < 100) {
        checks.canvas = true;
        botScore += 15;
      }
    } else {
      checks.canvas = true;
      botScore += 10;
    }
  } catch {
    checks.canvas = true;
    botScore += 5;
  }

  try {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName }).then(() => {});
    }
  } catch {
    checks.permissions = true;
    botScore += 5;
  }

  const touchPoints = nav.maxTouchPoints || 0;
  const hasTouchEvent = 'ontouchstart' in window;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(nav.userAgent || '');
  
  if (isMobile && touchPoints === 0 && !hasTouchEvent) {
    checks.touchSupport = true;
    botScore += 10;
  }

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  if (screenWidth === 0 || screenHeight === 0 || windowWidth === 0 || windowHeight === 0) {
    checks.screenResolution = true;
    botScore += 10;
  }

  const fingerprint = generateFingerprint();

  const isBot = botScore >= 50;

  return {
    isBot,
    score: Math.min(botScore, 100),
    checks,
    fingerprint,
    timestamp: Date.now(),
  };
}

function generateFingerprint(): string {
  if (typeof window === 'undefined') return 'server';
  
  const components: string[] = [];
  
  components.push(navigator.userAgent || 'unknown');
  components.push(navigator.language || 'unknown');
  components.push(String(navigator.hardwareConcurrency || 0));
  components.push(String((navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0));
  components.push(`${window.screen.width}x${window.screen.height}`);
  components.push(String(window.screen.colorDepth));
  components.push(String(navigator.maxTouchPoints || 0));
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown');
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown');
        components.push(webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown');
      }
    }
  } catch {
    components.push('webgl-error');
  }
  
  const raw = components.join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function createBehaviorMonitor() {
  if (typeof window === 'undefined') {
    return {
      getMetrics: () => ({
        mouseMovements: 0,
        clicks: 0,
        keyPresses: 0,
        scrolls: 0,
        timeOnPage: 0,
        suspiciousPatterns: false,
      }),
      destroy: () => {},
    };
  }

  let mouseMovements = 0;
  let clicks = 0;
  let keyPresses = 0;
  let scrolls = 0;
  const startTime = Date.now();
  const mouseTimes: number[] = [];
  let lastMouseTime = 0;

  const handleMouseMove = () => {
    mouseMovements++;
    const now = Date.now();
    if (lastMouseTime > 0) {
      mouseTimes.push(now - lastMouseTime);
      if (mouseTimes.length > 100) mouseTimes.shift();
    }
    lastMouseTime = now;
  };

  const handleClick = () => { clicks++; };
  const handleKeyPress = () => { keyPresses++; };
  const handleScroll = () => { scrolls++; };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('click', handleClick);
  window.addEventListener('keypress', handleKeyPress);
  window.addEventListener('scroll', handleScroll);

  return {
    getMetrics: () => {
      const timeOnPage = Date.now() - startTime;
      
      let suspiciousPatterns = false;
      
      if (mouseTimes.length >= 10) {
        const intervals = mouseTimes.slice(-10);
        const allSame = intervals.every(t => Math.abs(t - intervals[0]) < 5);
        if (allSame) suspiciousPatterns = true;
      }
      
      if (timeOnPage > 5000 && mouseMovements === 0 && clicks > 0) {
        suspiciousPatterns = true;
      }
      
      return {
        mouseMovements,
        clicks,
        keyPresses,
        scrolls,
        timeOnPage,
        suspiciousPatterns,
      };
    },
    destroy: () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('scroll', handleScroll);
    },
  };
}

export function performTimingCheck(): boolean {
  if (typeof window === 'undefined') return true;
  
  const start = performance.now();
  
  let result = 0;
  for (let i = 0; i < 100000; i++) {
    result += Math.sqrt(i);
  }
  
  const elapsed = performance.now() - start;
  
  if (elapsed < 0.5) {
    return true;
  }
  
  return false;
}

export function checkConsoleOverrides(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const originalLog = console.log.toString();
    if (!originalLog.includes('[native code]')) {
      return true;
    }
  } catch {
    return true;
  }
  
  return false;
}
