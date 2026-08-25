"use client";

interface CoinStatsData {
  high: number;
  low: number;
  change: number;
  volume?: number;
}

interface OptionStatsProps {
  data?: CoinStatsData;
}

export default function OptionStats({ data }: OptionStatsProps) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-0 mt-2">

      <div className="bg-gray-800 p-2 rounded-lg">
        <div className="text-gray-400 text-sm">Current Price</div>
        <div className="text-sm font-semibold">${data.high.toLocaleString()}</div>
      </div>

      <div className="bg-gray-800 p-2 rounded-lg">
        <div className="text-gray-400 text-sm">24h Change</div>
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold text-sm ${
              data.change >= 0 ? "text-green-400" : "text-red-400"
            }`}>
            {data.change >= 0 ? "+" : ""}{data.change.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="bg-gray-800 p-2 rounded-lg">
        <div className="text-gray-400 text-sm">24h High</div>
        <div className="text-sm font-semibold">${data.high.toLocaleString()}</div>
      </div>

      <div className="bg-gray-800 p-2 rounded-lg">
        <div className="text-gray-400 text-sm">24h Low</div>
        <div className="text-sm font-semibold">${data.low.toLocaleString()}</div>
      </div>

    </div>
  );
}
