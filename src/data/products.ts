// Demo product data - in production this would come from Supabase
import helmet1 from "@/assets/products/helmet-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import gloves1 from "@/assets/products/gloves-1.jpg";
import visor1 from "@/assets/products/visor-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isPreorder: boolean;
  isSoldOut: boolean;
}

export const products: Product[] = [
  // Helmets
  {
    id: "h1",
    name: "AGV K5 S Racing Helmet - Tricolor Edition",
    description: "Premium full-face racing helmet with advanced aerodynamics",
    price: 15999,
    originalPrice: 18999,
    brand: "AGV",
    category: "helmets",
    image: helmet1,
    rating: 4.8,
    reviewCount: 124,
    stock: 15,
    isPreorder: true,
    isSoldOut: false,
  },
  {
    id: "h2",
    name: "HJC RPHA 11 Pro Carbon - Matte Black",
    description: "Lightweight carbon fiber helmet for serious riders",
    price: 32999,
    originalPrice: 38999,
    brand: "HJC",
    category: "helmets",
    image: helmet2,
    rating: 4.9,
    reviewCount: 89,
    stock: 8,
    isPreorder: true,
    isSoldOut: false,
  },
  {
    id: "h3",
    name: "MT Thunder 3 SV - Pop Art Edition",
    description: "Stylish full-face helmet with unique artistic design",
    price: 5799,
    originalPrice: 7499,
    brand: "MT",
    category: "helmets",
    image: helmet3,
    rating: 4.5,
    reviewCount: 256,
    stock: 25,
    isPreorder: true,
    isSoldOut: false,
  },
  {
    id: "h4",
    name: "LS2 Storm II - Gloss White",
    description: "Modern touring helmet with sun visor",
    price: 8999,
    brand: "LS2",
    category: "helmets",
    image: helmet1,
    rating: 4.3,
    reviewCount: 67,
    stock: 0,
    isPreorder: true,
    isSoldOut: true,
  },
  // Riding Gears
  {
    id: "g1",
    name: "Rynox Storm Evo 2 Riding Jacket",
    description: "All-weather touring jacket with CE Level 2 armor",
    price: 7499,
    originalPrice: 8999,
    brand: "Rynox",
    category: "riding-gears",
    image: jacket1,
    rating: 4.7,
    reviewCount: 198,
    stock: 30,
    isPreorder: true,
    isSoldOut: false,
  },
  {
    id: "g2",
    name: "Alpinestars GP Pro R3 Gloves",
    description: "Premium racing gloves with kangaroo leather",
    price: 12999,
    brand: "Alpinestars",
    category: "riding-gears",
    image: gloves1,
    rating: 4.9,
    reviewCount: 45,
    stock: 12,
    isPreorder: true,
    isSoldOut: false,
  },
  // Helmet Accessories
  {
    id: "a1",
    name: "AGV Pista GP RR Blue Iridium Visor",
    description: "Premium anti-scratch visor with Pinlock ready",
    price: 4999,
    originalPrice: 5999,
    brand: "AGV",
    category: "helmet-accessories",
    image: visor1,
    rating: 4.6,
    reviewCount: 78,
    stock: 20,
    isPreorder: true,
    isSoldOut: false,
  },
  // Motorcycle Accessories
  {
    id: "m1",
    name: "Sena 50S Bluetooth Intercom",
    description: "Premium mesh 2.0 intercom with Harman Kardon speakers",
    price: 34999,
    originalPrice: 39999,
    brand: "Sena",
    category: "motorcycle-accessories",
    image: intercom1,
    rating: 4.8,
    reviewCount: 156,
    stock: 10,
    isPreorder: true,
    isSoldOut: false,
  },
];

export const getBestsellers = () => products.filter(p => !p.isSoldOut).slice(0, 4);

export const getProductsByCategory = (category: string) => 
  products.filter(p => p.category === category);

export const categories = [
  { 
    name: "Helmets", 
    slug: "helmets",
    description: "Premium helmets from top brands"
  },
  { 
    name: "Riding Gears", 
    slug: "riding-gears",
    description: "Jackets, pants, suits & boots"
  },
  { 
    name: "Helmet Accessories", 
    slug: "helmet-accessories",
    description: "Visors, intercoms & more"
  },
  { 
    name: "Motorcycle Accessories", 
    slug: "motorcycle-accessories",
    description: "Gadgets & bike accessories"
  },
];
