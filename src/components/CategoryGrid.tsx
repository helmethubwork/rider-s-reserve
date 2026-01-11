import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import helmet1 from "@/assets/products/helmet-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import gloves1 from "@/assets/products/gloves-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";

interface CategoryItem {
  name: string;
  subtitle: string;
  href: string;
  image: string;
}

const categories: CategoryItem[] = [
  { name: "Helmets", subtitle: "Full Face, Modular, Open Face & More", href: "/category/helmets", image: helmet1 },
  { name: "Jackets", subtitle: "Mesh, Leather & Textile", href: "/category/riding-gears?type=jackets", image: jacket1 },
  { name: "Gloves", subtitle: "Racing & Touring", href: "/category/riding-gears?type=gloves", image: gloves1 },
  { name: "Pants", subtitle: "Riding Jeans & Pants", href: "/category/riding-gears?type=pants", image: helmet2 },
  { name: "Boots", subtitle: "Touring & Racing Boots", href: "/category/riding-gears?type=boots", image: helmet3 },
  { name: "Communication", subtitle: "Intercoms & Bluetooth", href: "/category/helmet-accessories?type=intercoms", image: intercom1 },
  { name: "Luggage", subtitle: "Saddlebags & Tank Bags", href: "/category/motorcycle-accessories?type=luggage", image: visor1 },
  { name: "Accessories", subtitle: "Visors, Locks & More", href: "/category/motorcycle-accessories", image: gloves1 },
];

const CategoryCard = ({ category, isLarge = false }: { category: CategoryItem; isLarge?: boolean }) => {
  return (
    <Link
      to={category.href}
      className={`relative block overflow-hidden group ${
        isLarge ? "min-h-[400px] md:min-h-[500px]" : "min-h-[280px] md:min-h-[350px]"
      }`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 absolute inset-0"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-8">
        <span className="text-xs md:text-sm text-primary font-bold uppercase tracking-[0.2em] mb-2">
          Shop Now
        </span>
        <h3 className={`font-black text-white uppercase tracking-wide mb-2 ${
          isLarge ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-3xl lg:text-4xl"
        }`}>
          {category.name}
        </h3>
        <p className="text-white/80 text-sm md:text-base max-w-xs">
          {category.subtitle}
        </p>
        
        {/* Arrow indicator */}
        <div className="mt-4 flex items-center gap-2 text-primary">
          <span className="text-sm font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
            Explore
          </span>
          <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 border-4 border-primary/0 group-hover:border-primary transition-all duration-300" />
    </Link>
  );
};

const CategoryGrid = () => {
  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-wider">
            Shop By Category
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-4" />
        </div>
        
        {/* First row - 2 large banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <CategoryCard category={categories[0]} isLarge={true} />
          <CategoryCard category={categories[1]} isLarge={true} />
        </div>
        
        {/* Second row - 3 medium banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <CategoryCard category={categories[2]} />
          <CategoryCard category={categories[3]} />
          <CategoryCard category={categories[4]} />
        </div>
        
        {/* Third row - 3 medium banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CategoryCard category={categories[5]} />
          <CategoryCard category={categories[6]} />
          <CategoryCard category={categories[7]} />
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
