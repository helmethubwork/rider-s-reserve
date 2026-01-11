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
  size: "large" | "medium" | "small";
}

const categories: CategoryItem[] = [
  { name: "Helmets", subtitle: "Full Face, Modular, Open Face & More", href: "/category/helmets", image: helmet1, size: "large" },
  { name: "Jackets", subtitle: "Mesh, Leather & Textile", href: "/category/riding-gears?type=jackets", image: jacket1, size: "medium" },
  { name: "Gloves", subtitle: "Racing & Touring", href: "/category/riding-gears?type=gloves", image: gloves1, size: "medium" },
  { name: "Pants", subtitle: "Riding Jeans & Pants", href: "/category/riding-gears?type=pants", image: helmet2, size: "small" },
  { name: "Boots", subtitle: "Touring & Racing Boots", href: "/category/riding-gears?type=boots", image: helmet3, size: "small" },
  { name: "Communication", subtitle: "Intercoms & Bluetooth", href: "/category/helmet-accessories?type=intercoms", image: intercom1, size: "small" },
  { name: "Luggage", subtitle: "Saddlebags & Tank Bags", href: "/category/motorcycle-accessories?type=luggage", image: visor1, size: "small" },
  { name: "Accessories", subtitle: "Visors, Locks & More", href: "/category/motorcycle-accessories", image: gloves1, size: "small" },
];

const CategoryCard = ({ category }: { category: CategoryItem }) => {
  const sizeClasses = {
    large: "col-span-2 row-span-2 aspect-square md:aspect-auto",
    medium: "col-span-1 row-span-2 aspect-[3/4]",
    small: "col-span-1 row-span-1 aspect-square",
  };

  return (
    <Link
      to={category.href}
      className={`relative block overflow-hidden group ${sizeClasses[category.size]}`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-end p-4 md:p-6">
        <span className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider mb-1">
          Shop Now
        </span>
        <h3 className={`font-bold text-white uppercase tracking-wide mb-1 ${
          category.size === "large" ? "text-2xl md:text-4xl" : 
          category.size === "medium" ? "text-xl md:text-2xl" : 
          "text-lg md:text-xl"
        }`}>
          {category.name}
        </h3>
        <p className={`text-white/70 ${
          category.size === "small" ? "text-xs hidden md:block" : "text-xs md:text-sm"
        }`}>
          {category.subtitle}
        </p>
        
        {/* Arrow indicator */}
        <div className="mt-3 flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
          <span className="text-sm font-medium">Explore</span>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-300" />
    </Link>
  );
};

const CategoryGrid = () => {
  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground uppercase tracking-wider">
            Shop By Category
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-3" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
