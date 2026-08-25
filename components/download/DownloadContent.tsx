"use client";

import { useLanguage } from "@/context/LanguageContext";
import { QrCode, Smartphone, Apple, Zap, ShieldCheck, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

import { useRef, useState, useEffect } from "react";
import IOSInstallGuide from "@/components/pwa/IOSInstallGuide";

export default function DownloadContent() {
  const { t } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                  {t("download.title") || "Trade Everywhere"}
                </span>
                <br />
                <span className="text-white">{t("download.subtitle") || "Download the App"}</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
                 {t("download.desc") || "Stay connected to the markets anytime, anywhere. Experience the full power of our crypto exchange on your mobile device."}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <Link href="/app.apk" target="_blank" className="group">
                    <button className="flex items-center gap-4 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto">
                        <div className="p-2 bg-white/20 rounded-lg">
                             <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85M16.81,8.88L14.54,11.15L6.05,2.66M18.59,14.09L21.45,12.43C21.79,12.23 22,11.93 22,11.5C22,11.07 21.79,10.77 21.45,10.57L18.59,8.91L15.39,12.11"/></svg>
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-blue-100 font-medium uppercase tracking-wide">Download for</div>
                            <div className="text-xl font-bold">Android APK</div>
                        </div>
                    </button>
                 </Link>

                 <button 
                    onClick={() => {
                        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
                        // @ts-ignore
                        const isStandalone = window.navigator.standalone === true;

                        if (isIOS && !isStandalone) {
                            setShowIOSGuide(true);
                        } else {
                            // If desktop or android or already installed, maybe redirect to app store or show message
                            // User asked to specifically handle iOS PWA install.
                            // For others we can just alert or do nothing as there is no real iOS app.
                            toast("Please use the 'Share' -> 'Add to Home Screen' menu in Safari to install.", {
                              duration: 5000,
                              icon: '📱'
                            });
                        }
                    }}
                    className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-xl transition-all shadow-lg hover:bg-gray-200 w-full sm:w-auto"
                 >
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Apple className="w-8 h-8 text-black" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Download for</div>
                        <div className="text-xl font-bold">iOS</div>
                    </div>
                 </button>
              </div>

              {/* IOS Guide Overlay */}
              {showIOSGuide && <IOSInstallGuide onClose={() => setShowIOSGuide(false)} />}

              
            </div>

            {/* Right Image */}
            <div className="relative animate-in slide-in-from-right-10 duration-1000 fade-in delay-200">
                <div className="relative z-10">
                    <img 
                        src="/responsive.png" 
                        alt="App Screenshots" 
                        className="w-full max-w-lg mx-auto drop-shadow-2xl"
                    />
                </div>
                
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -z-10"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#0f1b33] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Download Our App?</h2>
                <p className="text-gray-400">Experience the future of trading in your pocket</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<Zap className="w-8 h-8 text-yellow-400" />}
                    title="Lightning Fast"
                    desc="Execute trades in milliseconds with our optimized mobile trading engine."
                />
                <FeatureCard 
                    icon={<ShieldCheck className="w-8 h-8 text-green-400" />}
                    title="Secure & Safe"
                    desc="Bank-grade security features including biometric login and cold storage."
                />
                <FeatureCard 
                    icon={<Globe className="w-8 h-8 text-blue-400" />}
                    title="Global Access"
                    desc="Trade from anywhere in the world with 24/7 multilingual support."
                />
             </div>
        </div>
      </section>
    </>
  );
}



function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-[#162445] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 duration-300">
            <div className="mb-6 p-4 bg-[#0b1426] w-fit rounded-xl border border-white/5">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}
