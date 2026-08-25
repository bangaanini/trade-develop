"use client";

import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, ArrowLeftRight, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function QuickActions({ variant = 'list' }: { variant?: 'list' | 'grid' }) {
  const { t } = useLanguage();
  const router = useRouter();

  const containerClasses = variant === 'list' 
    ? "bg-card border border-border rounded-xl overflow-hidden shadow-sm"
    : "grid grid-cols-2 lg:grid-cols-4 gap-4";

  return (
    <div className={containerClasses}>
      <ActionItem
        icon={ArrowDownToLine}
        title={t('common.deposit')}
        onClick={() => router.push("/deposit")}
        color="yellow"
        variant={variant}
      />
      
      <ActionItem
        icon={ArrowUpFromLine}
        title={t('common.withdraw')}
        onClick={() => router.push("/withdraw")}
        color="blue"
        variant={variant}
      />
      
      <ActionItem
        icon={RefreshCw}
        title={t('wallet.swap')}
        onClick={() => router.push("/swap")}
        color="green"
        variant={variant}
      />
      
      <ActionItem
        icon={ArrowLeftRight}
        title={t('wallet.transfer')}
        onClick={() => router.push("/transfer")}
        color="purple"
        last
        variant={variant}
      />
    </div>
  );
}

interface ActionItemProps {
  icon: any;
  title: string;
  onClick: () => void;
  color: "yellow" | "blue" | "green" | "purple";
  last?: boolean;
  variant?: 'list' | 'grid';
}

function ActionItem({ icon: Icon, title, onClick, color, last, variant = 'list' }: ActionItemProps) {
  const colorClasses = {
    yellow: "bg-yellow-500/10 text-yellow-500",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  if (variant === 'grid') {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition gap-3"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="font-semibold text-sm">{title}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 border-b border-border hover:bg-muted/10 transition ${last ? "border-0" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
