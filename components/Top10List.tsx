// components/Top10List.tsx
type Item = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
};

export default function Top10List({ items }: { items: Item[] }) {
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const change = parseFloat(it.priceChangePercent);
        const changeClass = change >= 0 ? "text-green-400" : "text-red-400";
        return (
          <div key={it.symbol} className="flex items-center justify-between p-2 rounded hover:bg-slate-800">
            <div>
              <div className="font-medium">{it.symbol}</div>
              <div className="text-xs text-slate-400">Vol: {parseFloat(it.volume).toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{parseFloat(it.lastPrice).toFixed(6)}</div>
              <div className={`text-xs ${changeClass}`}>{change.toFixed(2)}%</div>
            </div>
          </div>
        );
      })}
      {items.length === 0 && <div className="text-slate-500 text-center py-6">No data</div>}
    </div>
  );
}
