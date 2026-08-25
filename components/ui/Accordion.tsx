"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // using text if lucide not available, but usually lucide is standard in shadcn/modern. I'll use svgs to be safe.

export default function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-foreground bg-muted/10 hover:bg-muted/20 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-70">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-70">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            {children}
        </div>
      )}
    </div>
  );
}
