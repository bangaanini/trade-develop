import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { getSetting, getImage, formatImageUrl } from '@/lib/settings';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Generate dynamic page metadata for SEO based on admin settings
 */
export async function generateMetadata({
  title,
  description,
  keywords,
  path = '',
  ogImage,
  noIndex = false,
}: SEOProps = {}): Promise<Metadata> {
  let dbSiteName = siteConfig.name;
  let dbSiteTitle = siteConfig.title;
  let dbSiteDesc = siteConfig.description;
  let dbKeywords: string[] = siteConfig.keywords;

  try {
    const fetchedName = (await getSetting('site_name')) || (await getSetting('seo_site_name'));
    if (fetchedName) dbSiteName = fetchedName;

    const fetchedTitle = (await getSetting('site_title')) || (await getSetting('seo_site_title'));
    if (fetchedTitle) dbSiteTitle = fetchedTitle;

    const fetchedDesc = (await getSetting('site_description')) || (await getSetting('seo_site_description'));
    if (fetchedDesc) dbSiteDesc = fetchedDesc;

    const rawKeywords = (await getSetting('site_keywords')) || (await getSetting('seo_site_keywords'));
    if (Array.isArray(rawKeywords)) {
      dbKeywords = rawKeywords;
    } else if (typeof rawKeywords === 'string' && rawKeywords.trim()) {
      try {
        const parsed = JSON.parse(rawKeywords);
        if (Array.isArray(parsed)) dbKeywords = parsed;
        else dbKeywords = rawKeywords.split(',').map(s => s.trim());
      } catch {
        dbKeywords = rawKeywords.split(',').map(s => s.trim());
      }
    }
  } catch (e) {
    console.warn('Fallback to siteConfig for SEO metadata:', e);
  }

  let faviconUrl = '/favicon.ico';
  let ogImageUrl = siteConfig.ogImage.url;

  try {
    const faviconImg = await getImage('favicon');
    if (faviconImg?.file_url) {
      faviconUrl = formatImageUrl(faviconImg.file_url) || faviconImg.file_url;
    }

    const ogImg = await getImage('og_image');
    const logoImg = await getImage('logo');
    if (ogImg?.file_url) {
      ogImageUrl = formatImageUrl(ogImg.file_url) || ogImg.file_url;
    } else if (logoImg?.file_url) {
      ogImageUrl = formatImageUrl(logoImg.file_url) || logoImg.file_url;
    }
  } catch (e) {
    console.warn('Fallback to siteConfig for images:', e);
  }

  const pageTitle = title
    ? `${title} | ${dbSiteName}`
    : dbSiteTitle;

  const pageDescription = description || dbSiteDesc;
  const pageKeywords = keywords || dbKeywords;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageOgImage = ogImage || ogImageUrl;
  const fullOgImageUrl = pageOgImage.startsWith('http')
    ? pageOgImage
    : `${siteConfig.url}${pageOgImage}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: Array.isArray(pageKeywords) ? pageKeywords.join(', ') : pageKeywords,
    authors: [{ name: dbSiteName }],
    creator: dbSiteName,
    publisher: dbSiteName,

    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },

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
      siteName: dbSiteName,
      images: [
        {
          url: fullOgImageUrl,
          width: 1200,
          height: 630,
          alt: dbSiteName,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [fullOgImageUrl],
      creator: siteConfig.social.twitter,
    },
  };
}
