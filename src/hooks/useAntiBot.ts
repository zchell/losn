"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  detectBot, 
  createBehaviorMonitor, 
  performTimingCheck, 
  checkConsoleOverrides,
  type BotDetectionResult 
} from '@/lib/antiBot';

interface AntiBotState {
  isVerifying: boolean;
  isVerified: boolean;
  isBot: boolean;
  threatScore: number;
  error: string | null;
}

interface UseAntiBotOptions {
  autoVerify?: boolean;
  onBotDetected?: () => void;
  onVerified?: () => void;
  minTimeBeforeVerify?: number;
}

export function useAntiBot(options: UseAntiBotOptions = {}) {
  const {
    autoVerify = true,
    onBotDetected,
    onVerified,
    minTimeBeforeVerify = 500,
  } = options;

  const [state, setState] = useState<AntiBotState>({
    isVerifying: false,
    isVerified: false,
    isBot: false,
    threatScore: 0,
    error: null,
  });

  const behaviorMonitorRef = useRef<ReturnType<typeof createBehaviorMonitor> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    behaviorMonitorRef.current = createBehaviorMonitor();

    return () => {
      if (behaviorMonitorRef.current) {
        behaviorMonitorRef.current.destroy();
      }
    };
  }, []);

  const verify = useCallback(async (): Promise<boolean> => {
    if (hasVerifiedRef.current) {
      return !state.isBot;
    }

    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const timeElapsed = Date.now() - startTimeRef.current;
      if (timeElapsed < minTimeBeforeVerify) {
        await new Promise(resolve => setTimeout(resolve, minTimeBeforeVerify - timeElapsed));
      }

      const botDetection: BotDetectionResult = detectBot();
      const timingCheckFailed = performTimingCheck();
      const consoleOverridden = checkConsoleOverrides();

      const behaviorMetrics = behaviorMonitorRef.current?.getMetrics() || {
        mouseMovements: 0,
        clicks: 0,
        keyPresses: 0,
        scrolls: 0,
        timeOnPage: 0,
        suspiciousPatterns: false,
      };

      const response = await fetch('/api/verify-human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fingerprint: botDetection.fingerprint,
          checks: botDetection.checks,
          score: botDetection.score,
          behaviorMetrics,
          timingCheckFailed,
          consoleOverridden,
          timestamp: botDetection.timestamp,
        }),
      });

      const result = await response.json();

      hasVerifiedRef.current = true;

      const isBot = !result.verified;
      const threatScore = result.threatScore || botDetection.score;

      setState({
        isVerifying: false,
        isVerified: true,
        isBot,
        threatScore,
        error: null,
      });

      if (isBot && onBotDetected) {
        onBotDetected();
      } else if (!isBot && onVerified) {
        onVerified();
      }

      return !isBot;
    } catch (error) {
      console.error('[Anti-Bot] Verification error:', error);
      setState(prev => ({
        ...prev,
        isVerifying: false,
        isVerified: true,
        isBot: false,
        error: null,
      }));
      return true;
    }
  }, [minTimeBeforeVerify, onBotDetected, onVerified, state.isBot]);

  useEffect(() => {
    if (autoVerify && !hasVerifiedRef.current) {
      const timer = setTimeout(() => {
        verify();
      }, minTimeBeforeVerify);

      return () => clearTimeout(timer);
    }
  }, [autoVerify, minTimeBeforeVerify, verify]);

  const reset = useCallback(() => {
    hasVerifiedRef.current = false;
    setState({
      isVerifying: false,
      isVerified: false,
      isBot: false,
      threatScore: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    verify,
    reset,
    behaviorMetrics: behaviorMonitorRef.current?.getMetrics(),
  };
}
