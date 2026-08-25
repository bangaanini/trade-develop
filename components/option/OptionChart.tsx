import AdvancedChart from "@/components/AdvancedChart";

export default function OptionChart({ symbol }: { symbol: string }) {
  return (
    <div className="w-full h-[400px] bg-card rounded-lg overflow-hidden">
       <AdvancedChart symbol={symbol} className="w-full h-full" />
    </div>
  );
}
