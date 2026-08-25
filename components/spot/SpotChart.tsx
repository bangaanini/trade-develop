import AdvancedChart from "@/components/AdvancedChart";

export default function SpotChart({ symbol }: { symbol: string }) {
  return (
    <div className="w-full h-full bg-card relative">
       <AdvancedChart symbol={symbol} className="w-full h-full" />
    </div>
  );
}
