"use client";

import { useEffect, useState } from "react";
import IOSInstallGuide from "./IOSInstallGuide";

export default function IOSInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    
    // Check if standalone (installed)
    // @ts-ignore
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user has closed it before
    const isHidden = localStorage.getItem("hideInstallBanner");

    if (isIOS && !isStandalone && !isHidden) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hideInstallBanner", "1");
  };

  const handleInstall = () => {
    setShowGuide(true);
  };

  if (!isVisible && !showGuide) return null;

  return (
    <>
      {isVisible && !showGuide && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0b0e11] text-white flex items-center justify-between px-4 py-3 border-t border-[#1e2329] z-9999 font-sans animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
             <img src="/icons/icon-192.png" alt="App Icon" className="w-10 h-10 rounded-[10px]" />
             <div className="flex flex-col">
                 <strong className="text-[14px]">TradeFreedom App</strong>
                 <span className="text-[12px] text-[#848e9c]">Install untuk pengalaman lebih cepat</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={handleInstall}
                className="bg-[#f0b90b] text-black font-semibold px-3.5 py-1.5 rounded-md text-[14px]"
              >
                  Install
              </button>
              <button 
                onClick={handleClose}
                className="bg-transparent border-none text-[#848e9c] text-[18px] px-2"
              >
                  ✕
              </button>
          </div>
        </div>
      )}

      {showGuide && <IOSInstallGuide onClose={() => setShowGuide(false)} />}
    </>
  );
}
