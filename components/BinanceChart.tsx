"use client";

import { useEffect, useRef, memo } from "react";
import { useTheme } from "next-themes";

interface Props {
  symbol: string; // BTC, ETH, BNB
  interval?: string; // 1 | 5 | 15 | 30 | 60 | 240 | D | W
  height?: number;
}

function BinanceChart({ symbol, interval = "5", height }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const { resolvedTheme } = useTheme();
  
  // Convert interval format
  const convertInterval = (interval: string): string => {
    const intervalMap: Record<string, string> = {
      "1s": "1",
      "1m": "1",
      "5m": "5",
      "15m": "15",
      "30m": "30",
      "1h": "60",
      "4h": "240",
      "1d": "D",
      "1w": "W",
    };
    return intervalMap[interval.toLowerCase()] || interval;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    // Remove old script if exists
    if (scriptRef.current) {
      scriptRef.current.remove();
    }

    // Determine theme
    const currentTheme = resolvedTheme || "dark";
    const theme = currentTheme === "dark" ? "dark" : "light";

    // Generate unique ID for this instance
    const uniqueId = `tradingview_${Math.random().toString(36).substring(7)}`;

    // Create widget container
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    const widgetDiv = document.createElement("div");
    widgetDiv.id = uniqueId;
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "calc(100% - 32px)";
    widgetDiv.style.width = "100%";

    widgetContainer.appendChild(widgetDiv);

    // Create script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";

    // Widget configuration
    const config = {
      autosize: true,
      symbol: `BINANCE:${symbol.toUpperCase()}USDT`,
      interval: convertInterval(interval),
      timezone: "Asia/Jakarta",
      theme: theme,
      style: "1", // Candlestick
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      backgroundColor: theme === "dark" ? "#181a20" : "#ffffff",
      gridColor: theme === "dark" ? "#2B2B43" : "#e0e3eb",
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      // Mobile optimizations
      studies: [],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      container_id: uniqueId
    };

    script.innerHTML = JSON.stringify(config);
    widgetContainer.appendChild(script);
    scriptRef.current = script;

    // Append to container
    if (containerRef.current) {
      containerRef.current.appendChild(widgetContainer);
    }

    // Cleanup
    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [symbol, interval, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ 
        height: height ? `${height}px` : "100%",
        minHeight: height || 350
      }}
    />
  );
}

export default memo(BinanceChart);

