"use client";

import { useLanguage } from "@/context/LanguageContext";
import { QrCode, Smartphone } from "lucide-react";

export default function DownloadAppSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-[#11224a] px-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t("common.trade_on_go") || "Trade on the go"}
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
              {t("common.download_app_desc") || "Download our mobile app to trade anytime, anywhere. Experience seamless trading with our powerful mobile interface."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/download">
              <DownloadButton 
                store="appstore" 
                label="Download on the" 
                storeName="App Store" 
              />
              </a>
              <a href="/download">
                <DownloadButton 
                  store="playstore" 
                  label="Get it on" 
                  storeName="Google Play" 
                />
              </a>
            </div>

            
          </div>

          {/* Right Column: Image */}
          <div className="relative w-full flex justify-center lg:justify-end">
             <img 
               src="/responsive.png" 
               alt="Mobile App Preview" 
               className="w-full max-w-md lg:max-w-lg drop-shadow-2xl animate-in slide-in-from-right-10 duration-1000" 
             />
             
             {/* Decorative Elements */}
             <div className="absolute -z-10 top-1/2 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
             <div className="absolute -z-10 bottom-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
}

function DownloadButton({ store, label, storeName }: { store: 'appstore' | 'playstore', label: string, storeName: string }) {
  return (
    <button className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition shadow-lg group">
        <div className="w-8 h-8 flex items-center justify-center">
            {store === 'appstore' ? (
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.74-3.03 1.63-.61.73-1.12 1.83-1.01 2.98 1.18.09 2.37-.6 2.97-1.5z"/></svg>
            ) : (
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85M16.81,8.88L14.54,11.15L6.05,2.66M18.59,14.09L21.45,12.43C21.79,12.23 22,11.93 22,11.5C22,11.07 21.79,10.77 21.45,10.57L18.59,8.91L15.39,12.11"/></svg>
            )}
        </div>
        <div className="flex flex-col items-start -space-y-1">
            <span className="text-[10px] font-medium opacity-80">{label}</span>
            <span className="text-lg font-bold">{storeName}</span>
        </div>
    </button>
  );
}
