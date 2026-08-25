"use client";

import { useEffect, useRef } from "react";

export default function TradingViewWidget({ symbol, suffix = "" }: { symbol: string, suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const containerId = `tv_${symbol}${suffix}`;

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = ""; // reset widget setiap ganti symbol

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      new (window as any).TradingView.widget({
        container_id: containerId,
        autosize: true,
        symbol: `BINANCE:${symbol}USDT`,
        interval: "1",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#000000",
        enable_publishing: false,
        allow_symbol_change: false,
        hide_legend: true,
        hide_side_toolbar: true,
        studies: ["MACD@tv-basicstudies", "MA@tv-basicstudies"],
      });
    };

    ref.current.appendChild(script);
  }, [symbol, containerId]);

  return <div id={containerId} ref={ref} className="w-full h-full" />;
}


