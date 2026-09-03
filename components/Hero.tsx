import { getImage } from '@/lib/settings';
import HeroClient from './HeroClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Hero() {
  // Fetch hero background and logo images from database
  const heroImage = await getImage('hero_bg');
  const logoImage = await getImage('logo');

  const imageUrl = heroImage?.file_url || '/banner.png';
  const logoUrl = logoImage?.file_url || '/logo.png';

  return <HeroClient imageUrl={imageUrl} logoUrl={logoUrl} />;
}
