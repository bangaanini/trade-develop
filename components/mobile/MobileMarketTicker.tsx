export default function MobileMarketTicker({ data }: any) {
  return (
    <div className="md:hidden px-4 py-4">
      <div className="grid grid-cols-4 gap-2 text-center">

        {data.slice(0,4).map((coin: any) => {
          const color = coin.change >= 0 ? "text-success" : "text-danger";

          return (
            <div key={coin.symbol}>
              <div className="text-xs text-muted-foreground">{coin.symbol}/USDT</div>
              <div className="font-bold text-sm text-foreground">{coin.price.toFixed(2)}</div>
              <div className={`text-xs ${color}`}>{coin.change.toFixed(2)}%</div>
            </div>
          );
        })}

      </div>
    </div>
  );
}

