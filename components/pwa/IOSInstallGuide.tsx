"use client";

import { X, Share, PlusSquare } from "lucide-react";
import { useEffect } from "react";

interface IOSInstallGuideProps {
  onClose: () => void;
}

export default function IOSInstallGuide({ onClose }: IOSInstallGuideProps) {
  
  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/85 z-9999 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111] text-white p-6 rounded-2xl max-w-sm w-full text-center border border-white/10 shadow-2xl relative">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
            <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-bold mb-6 mt-2">Install TradeFreedom App</h3>
        
        <ol className="space-y-6 text-left relative">
            {/* Step 1 */}
            <li className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
                    1
                </div>
                <div>
                   <p className="text-gray-300 text-sm mb-1">Tap the <strong className="text-white">Share</strong> button</p>
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#222] rounded-lg border border-white/5 mt-1">
                       <Share className="w-4 h-4 text-blue-400" />
                       <span className="text-xs text-gray-400">Share</span>
                   </div>
                </div>
            </li>

            {/* Step 2 */}
            <li className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
                    2
                </div>
                <div>
                   <p className="text-gray-300 text-sm mb-1">Select <strong className="text-white">Add to Home Screen</strong></p>
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#222] rounded-lg border border-white/5 mt-1">
                       <PlusSquare className="w-4 h-4 text-gray-400" />
                       <span className="text-xs text-gray-400">Add to Home Screen</span>
                   </div>
                </div>
            </li>

             {/* Step 3 */}
             <li className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
                    3
                </div>
                <div>
                   <p className="text-gray-300 text-sm mb-1">Tap <strong className="text-white">Add</strong> (top right)</p>
                   <span className="text-xs text-gray-500">Confirm installation</span>
                </div>
            </li>
        </ol>

        <button 
            onClick={onClose}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all"
        >
            Got it
        </button>

      </div>
    </div>
  );
}
