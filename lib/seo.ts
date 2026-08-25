import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Generate page metadata for SEO
 */
export function generateMetadata({
  title,
  description,
  keywords,
  path = '',
  ogImage,
  noIndex = false,
}: SEOProps = {}): Metadata {
  const pageTitle = title 
    ? `${title} | ${siteConfig.name}`
    : siteConfig.title;
  
  const pageDescription = description || siteConfig.description;
  const pageKeywords = keywords || siteConfig.keywords;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageOgImage = ogImage || siteConfig.ogImage.url;
  const fullOgImageUrl = pageOgImage.startsWith('http') 
    ? pageOgImage 
    : `${siteConfig.url}${pageOgImage}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords.join(', '),
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    
    // Robots
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: fullOgImageUrl,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          alt: title || siteConfig.ogImage.alt,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [fullOgImageUrl],
      creator: siteConfig.social.twitter,
    },
    
    // Icons
    icons: {
      icon: [
        { url: siteConfig.favicon.ico },
        { url: siteConfig.favicon.png16, sizes: '16x16', type: 'image/png' },
        { url: siteConfig.favicon.png32, sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: siteConfig.favicon.appleTouchIcon, sizes: '180x180', type: 'image/png' },
      ],
    },
    
    // Verification (add your verification codes)
    verification: {
      google: '', // Add Google Search Console verification
      // yandex: '',
      // bing: '',
    },
    
    // Other
    alternates: {
      canonical: pageUrl,
    },
    
    // App-specific
    applicationName: siteConfig.name,
    
    // Format detection
    formatDetection: {
      telephone: false,
      email: false,
    },
  };
}

/**
 * Generate JSON-LD structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: siteConfig.company.name,
    description: siteConfig.company.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo.main}`,
    foundingDate: siteConfig.company.foundedYear,
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.contact.email,
      contactType: 'Customer Service',
      availableLanguage: ['English'],
    },
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

/**
 * Generate WebSite schema with search
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  };
}
