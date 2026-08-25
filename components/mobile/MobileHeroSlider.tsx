import { getAllImages } from '@/lib/settings';
import MobileHeroSliderClient from './MobileHeroSliderClient';

export default async function MobileHeroSlider() {
  // Fetch slider images from database
  const images = await getAllImages();
  
  const slides = [
    images.mobile_slide1?.file_url || '/slide1.jpg',
    images.mobile_slide2?.file_url || '/slide2.jpg',
    images.mobile_slide3?.file_url || '/slide3.jpg',
  ];

  return <MobileHeroSliderClient slides={slides} />;
}
