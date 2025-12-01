"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function DownloadGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the guide shortly after mounting (simulating download start)
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000);

    // Hide it after a few seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-8 z-50 flex flex-col items-end animate-bounce">
      <div className="text-blue-600 dark:text-blue-400 mb-2 font-bold text-lg bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-blue-200">
        Download started! Check here
      </div>
      <ArrowUp className="w-12 h-12 text-blue-600 dark:text-blue-400" strokeWidth={3} />
    </div>
  );
}
