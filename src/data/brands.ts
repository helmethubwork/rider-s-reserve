import axorLogo from '@/assets/brands/axor-logo.png';
import axxisLogo from '@/assets/brands/axxis-logo.png';
import kordaLogo from '@/assets/brands/korda-logo.png';
import ls2Logo from '@/assets/brands/ls2-logo.png';
import mtLogo from '@/assets/brands/mt-logo.png';
import nhkLogo from '@/assets/brands/nhk-logo.png';
import raidaLogo from '@/assets/brands/raida-logo.png';
import rynoxLogo from '@/assets/brands/rynox-logo.png';
import studdsLogo from '@/assets/brands/studds-logo.png';

export interface Brand {
  slug: string;
  name: string;
  logo: string;
  description: string;
  featured?: boolean;
}

export const brands: Brand[] = [
  {
    slug: 'axor',
    name: 'Axor',
    logo: axorLogo,
    description: 'Premium helmets designed for the modern rider. Axor combines cutting-edge technology with sleek aesthetics to deliver superior protection and style.',
    featured: true,
  },
  {
    slug: 'ls2',
    name: 'LS2 Helmets',
    logo: ls2Logo,
    description: 'Global leader in helmet manufacturing with over 25 years of experience. LS2 offers innovative designs with advanced safety features.',
    featured: true,
  },
  {
    slug: 'mt',
    name: 'MT Helmets',
    logo: mtLogo,
    description: 'Spanish helmet manufacturer known for exceptional quality and innovative designs. MT Helmets delivers premium protection at competitive prices.',
    featured: true,
  },
  {
    slug: 'rynox',
    name: 'Rynox',
    logo: rynoxLogo,
    description: 'India\'s leading riding gear brand, specializing in high-quality jackets, gloves, and accessories designed for Indian riding conditions.',
    featured: true,
  },
  {
    slug: 'studds',
    name: 'Studds',
    logo: studdsLogo,
    description: 'One of India\'s most trusted helmet brands with decades of experience in rider safety. Known for durability and affordability.',
    featured: true,
  },
  {
    slug: 'korda',
    name: 'Korda',
    logo: kordaLogo,
    description: 'Premium riding gear brand offering high-performance jackets, pants, and accessories for serious riders.',
  },
  {
    slug: 'nhk',
    name: 'NHK Helmets',
    logo: nhkLogo,
    description: 'Indonesian helmet brand known for stylish designs and reliable protection. Popular among young riders.',
  },
  {
    slug: 'axxis',
    name: 'Axxis',
    logo: axxisLogo,
    description: 'European helmet brand offering excellent value with certified safety standards and modern designs.',
  },
  {
    slug: 'raida',
    name: 'Raida',
    logo: raidaLogo,
    description: 'Adventure riding gear specialist offering durable gloves, bags, and accessories for touring enthusiasts.',
  },
];

export const getBrandBySlug = (slug: string): Brand | undefined => {
  return brands.find(brand => brand.slug === slug);
};

export const getFeaturedBrands = (): Brand[] => {
  return brands.filter(brand => brand.featured);
};
