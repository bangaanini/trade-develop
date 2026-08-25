import { getImage } from '@/lib/settings';
import HeroClient from './HeroClient';

export default async function Hero() {
  // Fetch hero background image from database
  const heroImage = await getImage('hero_bg');
  const imageUrl = heroImage?.file_url || '/banner.png';

  return <HeroClient imageUrl={imageUrl} />;
}
