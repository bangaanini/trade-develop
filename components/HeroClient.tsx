"use client";

import { useEffect, useState } from "react";

interface HeroClientProps {
  imageUrl: string;
  logoUrl?: string;
}

export default function HeroClient({ imageUrl, logoUrl }: HeroClientProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        setIsLoggedIn(!!session.user);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const displayLogo = logoUrl || "/logo.png";

  return (
    <section
      className="hidden md:block relative bg-[#11224a] text-white pt-20 pb-24 min-h-[600px] items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(17, 34, 74, 0.7), rgba(17, 34, 74, 0.7)), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-4xl mx-auto text-center px-6 py-20">
        {/* Main Heading / Hero Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={displayLogo}
            alt="logo"
            className="max-w-[320px] max-h-[160px] object-contain mx-auto drop-shadow-xl"
          />
        </div>

        {/* Subtitle */}
        <p className="text-3xl md:text-4xl font-bold text-gray-200 mb-8 max-w-2xl mx-auto">
          Achieve Financial Independence
        </p>

        {/* Description */}
        <p className="text-2xl text-gray-300 mb-10 max-w-xl mx-auto">
          Take control of your future through smart trading.
        </p>

        {/* CTA Button */}
        {loading ? (
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <button
            onClick={() => window.location.href = isLoggedIn ? "/option" : "/login"}
            className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {isLoggedIn ? "Trade Now →" : "Get Started →"}
          </button>
        )}

        {/* Optional: Feature badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Trading</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Fast Transactions</span>
          </div>
        </div>
      </div>
    </section>
  );
}
