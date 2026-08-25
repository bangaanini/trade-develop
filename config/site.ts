export const siteConfig = {
  // Site Identity
  name: "Trade Freedom",
  title: "Trade Freedom - Professional Crypto Trading Platform",
  description: "Trade Bitcoin, Ethereum, and 100+ cryptocurrencies with advanced tools. Spot trading, options, secure wallet, and 24/7 support.",
  tagline: "Your Gateway to Crypto Trading",
  
  // URLs
  url: "https://tradenfreedom.com",
  domain: "tradenfreedom.com",
  
  // SEO
  keywords: [
    "crypto trading",
    "bitcoin trading",
    "ethereum trading",
    "cryptocurrency exchange",
    "spot trading",
    "crypto options",
    "digital assets",
    "crypto wallet",
    "binance alternative",
    "trading platform"
  ],
  
  // Branding
  logo: {
    main: "/logo.png",
    alt: "Trade Freedom Logo",
    width: 40,
    height: 40,
  },
  
  favicon: {
    ico: "/favicon.ico",
    png16: "/favicon/favicon-16x16.png",
    png32: "/favicon/favicon-32x32.png",
    appleTouchIcon: "/apple-touch-icon.png",
  },
  
  // Open Graph / Social
  ogImage: {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Tools24 - Professional Crypto Trading",
  },
  
  // Social Media (optional - update with actual links)
  social: {
    twitter: "@tools24trading", // Update if you have
    facebook: "", // Update if you have
    instagram: "", // Update if you have
    telegram: "", // Update if you have
  },
  
  // Contact
  contact: {
    email: "support@tradenfreedom.com",
    supportUrl: "/support",
  },
  
  // Theme Colors
  colors: {
    primary: "#3b82f6", // blue
    background: "#11224a", // dark blue
    card: "#1a2f5a",
  },
  
  // Features
  features: [
    "Spot Trading",
    "Options Trading",
    "Secure Wallet",
    "KYC Verification",
    "24/7 Support",
    "Mobile Optimized",
  ],
  
  // Trading Pairs
  defaultPairs: ["BTC", "ETH", "BNB"],
  
  // Company Info (for structured data)
  company: {
    name: "Trade Freedom",
    foundedYear: "2024",
    description: "Leading cryptocurrency trading platform offering spot trading, options, and secure digital asset management.",
    type: "FinancialService",
  },
};

export type SiteConfig = typeof siteConfig;
