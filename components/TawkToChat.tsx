"use client";

import { useEffect } from 'react';

export default function TawkToChat() {
  useEffect(() => {
    // Initialize Tawk_API before script loads
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();
    
    // Configure Tawk.to to hide widget by default
    (window as any).Tawk_API.onLoad = function() {
      // Hide the default widget bubble
      (window as any).Tawk_API.hideWidget();
    };
    
    // Tawk.to Script - Official code from dashboard
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/694185338bf05b1980b8e752/1jck0h7qh';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return null;
}

