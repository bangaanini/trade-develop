import "./globals.css";
import Providers from "@/components/Providers";
import ClientLayout from "@/components/ClientLayout";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";

// Generate default metadata
export const metadata: Metadata = generateSEOMetadata();

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181a20" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Structured data for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: siteConfig.company.name,
    description: siteConfig.company.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo.main}`,
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "Customer Service",
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TradeFreedom" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="top-center" reverseOrder={false} />
        </Providers>
      </body>
    </html>
  );
}
