"use client";

import { useEffect, useRef, useState } from "react";
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  Time,
  MouseEventParams,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";
import { 
  Loader2, 
  Settings, 
  Maximize2, 
  ChevronDown,
  Layout,
  SlidersHorizontal,
  MousePointer2,
  Minus,
  Spline,
  Type,
  BoxSelect,
  Smile,
  Ruler,
  Magnet,
  Lock,
  Eye,
  Trash2
} from "lucide-react";
import { useTheme } from "next-themes";

interface Props {
  symbol: string;
  className?: string;
}

const INTERVALS = [
  { label: "1s", value: "1s" },
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
];

const MA_COLORS = {
  MA7: "#E8C248",   // Yellow/Gold
  MA25: "#A151E1",  // Purple
  MA99: "#5F88EA",  // Blueish
};

// Theme Definitions
const THEMES = {
  dark: {
    background: "#161A1E",
    textColor: "#848E9C",
    gridColor: "#2A2E39",
    crosshairColor: "#5E6673",
    borderColor: "#2B3139",
    upColor: "#0ECB81",
    downColor: "#F6465D",
    timeframeActiveText: "#F0B90B",
    timeframeActiveBg: "#2B3139",
    sidebarBg: "#161A1E",
    sidebarActiveBg: "rgba(240, 185, 11, 0.1)",
    sidebarActiveText: "#F0B90B"
  },
  light: {
    background: "#FFFFFF",
    textColor: "#76808F",
    gridColor: "#F0F3FA",
    crosshairColor: "#76808F",
    borderColor: "#EAECEF",
    upColor: "#0ECB81",
    downColor: "#F6465D",
    timeframeActiveText: "#1E2329", // Dark Text
    timeframeActiveBg: "#F5F5F5",
    sidebarBg: "#FFFFFF",
    sidebarActiveBg: "#F5F5F5",
    sidebarActiveText: "#1E2329"
  }
};

// Helper to calculate Simple Moving Average
function calculateSMA(data: { time: Time; close: number }[], count: number) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < count - 1) {
      result.push({ time: data[i].time, value: NaN }); // Not enough data
      continue;
    }
    let sum = 0;
    for (let j = 0; j < count; j++) {
      sum += data[i - j].close;
    }
    result.push({ time: data[i].time, value: sum / count });
  }
  return result;
}

export default function AdvancedChart({ symbol, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();
  
  // Use "dark" as default if theme is not yet resolved
  const currentTheme = THEMES[resolvedTheme === "light" ? "light" : "dark"];

  // Series Refs
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ma7SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma25SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ma99SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [interval, setInterval] = useState("1d");
  const [loading, setLoading] = useState(true);
  
  // Data for Legend
  const [legendData, setLegendData] = useState<{
    open: string;
    high: string;
    low: string;
    close: string;
    change: string;
    changePercent: string;
    color: string;
    volume: string;
    ma7: string;
    ma25: string;
    ma99: string;
  } | null>(null);

    // Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Chart is already cleaned up by the return function of the previous effect execution
    // but we double check just in case
    if (chartRef.current) {
        try {
            chartRef.current.remove();
        } catch (e) {
            // already disposed
        }
        chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: currentTheme.background },
        textColor: currentTheme.textColor,
        fontFamily: "DIN, -apple-system, BlinkMacSystemFont, sans-serif",
      },
      grid: {
        vertLines: { color: currentTheme.gridColor },
        horzLines: { color: currentTheme.gridColor },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: currentTheme.borderColor,
        rightOffset: 5,
        barSpacing: 8,
      },
      rightPriceScale: {
        borderColor: currentTheme.borderColor,
        scaleMargins: {
            top: 0.1,
            bottom: 0.2, // Leave space for volume
        },
        autoScale: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
            labelBackgroundColor: '#474D57',
            style: LineStyle.Dashed,
            color: currentTheme.crosshairColor,
        },
        horzLine: {
            labelBackgroundColor: '#474D57',
            style: LineStyle.Dashed,
            color: currentTheme.crosshairColor,
        }
      } 
    });

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: currentTheme.upColor,
      downColor: currentTheme.downColor,
      borderVisible: false,
      wickUpColor: currentTheme.upColor,
      wickDownColor: currentTheme.downColor,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 }
    });

    // 2. Volume Series (Overlay at bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // Overlay
    });
    volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
    });

    // 3. Moving Averages (Lines hidden, data kept for legend)
    const ma7Series = chart.addSeries(LineSeries, { color: 'transparent', lineWidth: 1, crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false });
    const ma25Series = chart.addSeries(LineSeries, { color: 'transparent', lineWidth: 1, crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false });
    const ma99Series = chart.addSeries(LineSeries, { color: 'transparent', lineWidth: 1, crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ma7SeriesRef.current = ma7Series;
    ma25SeriesRef.current = ma25Series;
    ma99SeriesRef.current = ma99Series;

    // Crosshair Handler
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
        if (!param.time || !candleSeries) return;

        const data = param.seriesData.get(candleSeries) as any;
        const vol = param.seriesData.get(volumeSeries) as any;
        const m7 = param.seriesData.get(ma7Series) as any;
        const m25 = param.seriesData.get(ma25Series) as any;
        const m99 = param.seriesData.get(ma99Series) as any;

        if (data) {
            const open = data.open;
            const close = data.close;
            const change = close - open;
            const changeP = (change / open) * 100;
            const isUp = close >= open;

            setLegendData({
                open: open.toLocaleString("en-US", {minimumFractionDigits: 2}),
                high: data.high.toLocaleString("en-US", {minimumFractionDigits: 2}),
                low: data.low.toLocaleString("en-US", {minimumFractionDigits: 2}),
                close: close.toLocaleString("en-US", {minimumFractionDigits: 2}),
                change: (change >= 0 ? "+" : "") + change.toLocaleString("en-US", {minimumFractionDigits: 2}),
                changePercent: (changeP >= 0 ? "+" : "") + changeP.toFixed(2) + "%",
                color: isUp ? currentTheme.upColor : currentTheme.downColor,
                volume: vol ? vol.value.toLocaleString("en-US", { notation: "compact" }) : "",
                ma7: m7?.value ? m7.value.toLocaleString("en-US", {minimumFractionDigits: 2}) : "",
                ma25: m25?.value ? m25.value.toLocaleString("en-US", {minimumFractionDigits: 2}) : "",
                ma99: m99?.value ? m99.value.toLocaleString("en-US", {minimumFractionDigits: 2}) : "",
            });
        }
    });

    // Responsive Handing with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length === 0 || !entries[0].contentRect) return;
        const { width, height } = entries[0].contentRect;
        chart.applyOptions({ width, height });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
         try {
             chartRef.current.remove();
         } catch(e) {}
         chartRef.current = null;
      }
    };
  }, [currentTheme]); // Re-create chart when theme changes

  // Data Fetch logic (Same as before)
  useEffect(() => {
    if (!symbol || !chartRef.current) return; // Wait for chart to init
    setLoading(true);

    let ws: WebSocket | null = null;
    let pollTimer: any = null;
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Use local proxy instead of direct Binance API to avoid CORS/Geo-blocking
        // Ensure we append USDT if the symbol is just the base coin (e.g. BTC -> BTCUSDT)
        // Check if symbol already ends with USDT to avoid BTCUSDTUSDT
        const pair = symbol.toUpperCase().endsWith("USDT") ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
        const res = await fetch(`/api/binance/proxy/klines?symbol=${pair}&interval=${interval}&limit=1000`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        if (!isMounted) return;

        const candles = data.map((d: any) => ({
          time: d[0] / 1000 as Time,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));

        const volumes = data.map((d: any) => ({
            time: d[0] / 1000 as Time,
            value: parseFloat(d[5]),
            color: parseFloat(d[4]) >= parseFloat(d[1]) ? currentTheme.upColor : currentTheme.downColor
        }));

        const closeData = candles.map((c: any) => ({ time: c.time, close: c.close }));
        const ma7Data = calculateSMA(closeData, 7).filter(d => !isNaN(d.value));
        const ma25Data = calculateSMA(closeData, 25).filter(d => !isNaN(d.value));
        const ma99Data = calculateSMA(closeData, 99).filter(d => !isNaN(d.value));

        if (candleSeriesRef.current) candleSeriesRef.current.setData(candles);
        if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volumes);
        if (ma7SeriesRef.current) ma7SeriesRef.current.setData(ma7Data);
        if (ma25SeriesRef.current) ma25SeriesRef.current.setData(ma25Data);
        if (ma99SeriesRef.current) ma99SeriesRef.current.setData(ma99Data);
        
        // Initial Hover Data
        const last = candles[candles.length - 1];
        if (last) {
            const change = last.close - last.open;
            const changeP = (change / last.open) * 100;
            const isUp = last.close >= last.open;
            const lastMA7 = ma7Data[ma7Data.length - 1]?.value;
            const lastMA25 = ma25Data[ma25Data.length - 1]?.value;
            const lastMA99 = ma99Data[ma99Data.length - 1]?.value;

            setLegendData({
                open: last.open.toLocaleString("en-US", {minimumFractionDigits: 2}),
                high: last.high.toLocaleString("en-US", {minimumFractionDigits: 2}),
                low: last.low.toLocaleString("en-US", {minimumFractionDigits: 2}),
                close: last.close.toLocaleString("en-US", {minimumFractionDigits: 2}),
                change: (change >= 0 ? "+" : "") + change.toLocaleString("en-US", {minimumFractionDigits: 2}),
                changePercent: (changeP >= 0 ? "+" : "") + changeP.toFixed(2) + "%",
                color: isUp ? currentTheme.upColor : currentTheme.downColor,
                volume: volumes[volumes.length - 1]?.value.toLocaleString("en-US", { notation: "compact" }) || "",
                ma7: lastMA7 ? lastMA7.toLocaleString("en-US", {minimumFractionDigits: 2}) : "",
                ma25: lastMA25 ? lastMA25.toLocaleString("en-US", {minimumFractionDigits: 2}) : "",
                ma99: lastMA99 ? lastMA99.toLocaleString("en-US", {minimumFractionDigits: 2}) : "",
            });
        }

        setLoading(false);

        const is1s = interval === "1s";
        const wsSymbol = symbol.toUpperCase().endsWith("USDT") ? symbol.toLowerCase() : `${symbol.toLowerCase()}usdt`;
        const streamName = is1s ? `${wsSymbol}@trade` : `${wsSymbol}@kline_${interval.toLowerCase()}`;

        let current1sCandle: any = null;

        const startPollingFallback = () => {
          if (pollTimer || !isMounted) return;
          console.log("Starting 1s polling fallback for chart...");
          pollTimer = window.setInterval(async () => {
            if (!isMounted) return;
            try {
              const res = await fetch(`/api/binance/proxy/klines?symbol=${pair}&interval=1m&limit=1`);
              if (res.ok) {
                const latest = await res.json();
                if (Array.isArray(latest) && latest.length > 0) {
                  const d = latest[0];
                  const timeSec = (is1s ? Math.floor(Date.now() / 1000) : Math.floor(d[0] / 1000)) as Time;
                  const close = parseFloat(d[4]);
                  const updatedCandle = {
                    time: timeSec,
                    open: parseFloat(d[1]),
                    high: Math.max(parseFloat(d[2]), close),
                    low: Math.min(parseFloat(d[3]), close),
                    close: close,
                  };
                  if (candleSeriesRef.current) candleSeriesRef.current.update(updatedCandle);
                }
              }
            } catch (e) {
              console.error("Polling fallback error:", e);
            }
          }, 1000);
        };

        const directWsUrl = `wss://stream.binance.com:9443/ws/${streamName}`;
        try {
          ws = new WebSocket(directWsUrl);

          ws.onopen = () => {
            console.log(`Connected to Binance WS: ${directWsUrl}`);
          };

          ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);

              if (is1s && message.e === "trade") {
                const price = parseFloat(message.p);
                const timeSec = Math.floor(message.E / 1000) as Time;

                if (current1sCandle && current1sCandle.time === timeSec) {
                  current1sCandle.high = Math.max(current1sCandle.high, price);
                  current1sCandle.low = Math.min(current1sCandle.low, price);
                  current1sCandle.close = price;
                } else {
                  current1sCandle = {
                    time: timeSec,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                  };
                }

                if (candleSeriesRef.current) candleSeriesRef.current.update(current1sCandle);
              } else if (message.k) {
                const k = message.k;
                const close = parseFloat(k.c);
                const t = (k.t / 1000) as Time;
                const updatedCandle = {
                  time: t,
                  open: parseFloat(k.o),
                  high: parseFloat(k.h),
                  low: parseFloat(k.l),
                  close: close,
                };
                const updatedVolume = {
                  time: t,
                  value: parseFloat(k.v),
                  color: close >= parseFloat(k.o) ? currentTheme.upColor : currentTheme.downColor,
                };

                if (candleSeriesRef.current) candleSeriesRef.current.update(updatedCandle);
                if (volumeSeriesRef.current) volumeSeriesRef.current.update(updatedVolume);
              }
            } catch (err) {
              console.error("WS message parse error:", err);
            }
          };

          ws.onerror = (error) => {
            console.warn("Binance WebSocket error, starting polling fallback...");
            startPollingFallback();
          };

          ws.onclose = () => {
            console.warn("Binance WebSocket closed, starting polling fallback...");
            startPollingFallback();
          };
        } catch (wsErr) {
          console.warn("Failed to create WebSocket, using polling fallback:", wsErr);
          startPollingFallback();
        }

      } catch (err) {
        console.error("Failed to load chart data:", err);
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      if (ws) ws.close();
      if (pollTimer) window.clearInterval(pollTimer);
    };
  }, [symbol, interval, currentTheme]);

  // Sidebar Tool Component
  const SidebarIcon = ({ icon: Icon, active = false }: { icon: any, active?: boolean }) => (
    <div className={`p-2 rounded cursor-pointer transition-all duration-200`}
       style={{ 
         color: active ? currentTheme.sidebarActiveText : currentTheme.textColor,
         backgroundColor: active ? currentTheme.sidebarActiveBg : "transparent",
       }}
    >
        <Icon className="w-5 h-5" strokeWidth={1.5} />
    </div>
  );

  return (
    <div 
      className={`flex flex-row h-full rounded-lg overflow-hidden border ${className}`}
      style={{ 
        backgroundColor: currentTheme.background, 
        borderColor: currentTheme.borderColor
      }}
    >
        <style jsx global>{`
          /* Hide TradingView Attribution in Lightweight Charts */
          .tv-lightweight-charts a[href*="tradingview.com"] {
            display: none !important;
          }
          /* Generic fallback if class changes */
          div[style*="z-index: 3"] > a[title*="TradingView"] {
              display: none !important;
          }
        `}</style>

        {/* LEFT SIDEBAR (TOOLS) */}
        <div 
            className="hidden md:flex flex-col items-center py-2 px-1 border-r w-[52px] shrink-0 gap-2"
            style={{ 
                backgroundColor: currentTheme.sidebarBg, 
                borderColor: currentTheme.borderColor 
            }}
        >
            <SidebarIcon icon={MousePointer2} active />
            <SidebarIcon icon={Minus} />
            <SidebarIcon icon={Spline} />
            <SidebarIcon icon={Type} />
            <SidebarIcon icon={BoxSelect} />
            <SidebarIcon icon={Smile} />
            <SidebarIcon icon={Ruler} />
            <SidebarIcon icon={Magnet} />
            <div className="mt-auto flex flex-col gap-2 items-center">
                <SidebarIcon icon={Lock} />
                <SidebarIcon icon={Eye} />
                <SidebarIcon icon={Trash2} />
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col flex-1 h-full min-w-0">
            {/* HEADER */}
            <div className="flex items-center justify-between px-3 h-[48px] border-b shrink-0" style={{ borderColor: currentTheme.borderColor }}>
                {/* LEFT: Timeframes */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <span className="text-[14px] mr-2 hidden sm:block" style={{ color: currentTheme.textColor }}>Time</span>
                    {INTERVALS.map((int) => (
                        <button
                            key={int.value}
                            onClick={() => setInterval(int.value)}
                            className={`text-[12px] font-medium px-2 py-1 transition-colors rounded whitespace-nowrap`}
                            style={{
                                color: interval === int.value ? currentTheme.timeframeActiveText : currentTheme.textColor,
                                backgroundColor: interval === int.value ? currentTheme.timeframeActiveBg : "transparent"
                            }}
                        >
                            {int.label}
                        </button>
                    ))}
                    <button className="ml-1" style={{ color: currentTheme.textColor }}>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>

                {/* RIGHT: Tools */}
                <div className="flex items-center gap-4 ml-auto">
                    <button style={{ color: currentTheme.textColor }}><SlidersHorizontal className="w-4 h-4" /></button>
                    <button style={{ color: currentTheme.textColor }}><Layout className="w-4 h-4" /></button>
                    <button style={{ color: currentTheme.textColor }}><Settings className="w-4 h-4" /></button>
                    <button style={{ color: currentTheme.textColor }}><Maximize2 className="w-4 h-4" /></button>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="relative flex-1 w-full min-h-0" style={{ backgroundColor: currentTheme.background }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#F0B90B" }} />
                    </div>
                )}
                
                {/* LEGEND */}
                <div className="absolute top-2 left-3 z-10 flex flex-col gap-1 pointer-events-none select-none text-[12px] font-mono leading-tight">
                    {legendData && (
                        <div className="flex flex-wrap gap-x-3" style={{ color: currentTheme.textColor }}>
                             <span>Open <span style={{ color: legendData.color }}>{legendData.open}</span></span>
                             <span>High <span style={{ color: legendData.color }}>{legendData.high}</span></span>
                             <span>Low <span style={{ color: legendData.color }}>{legendData.low}</span></span>
                             <span>Close <span style={{ color: legendData.color }}>{legendData.close}</span></span>
                             <span>Change <span style={{ color: legendData.color }}>{legendData.change} ({legendData.changePercent})</span></span>
                        </div>
                    )}
                    {legendData && (
                        <div className="flex flex-wrap gap-x-3 text-[12px]">
                             <span style={{ color: MA_COLORS.MA7 }}>MA(7) {legendData.ma7}</span>
                             <span style={{ color: MA_COLORS.MA25 }}>MA(25) {legendData.ma25}</span>
                             <span style={{ color: MA_COLORS.MA99 }}>MA(99) {legendData.ma99}</span>
                        </div>
                    )}
                </div>

                <div ref={containerRef} className="w-full h-full" />
            </div>
        </div>
    </div>
  );
}
