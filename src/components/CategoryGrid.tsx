import { Link } from "react-router-dom";
import helmet1 from "@/assets/products/helmet-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import gloves1 from "@/assets/products/gloves-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";

interface CategoryItem {
  name: string;
  href: string;
  image: string;
}

const categories: CategoryItem[] = [
  { name: "Helmets", href: "/category/helmets", image: helmet1 },
  { name: "Jackets", href: "/category/riding-gears?type=jackets", image: jacket1 },
  { name: "Gloves", href: "/category/riding-gears?type=gloves", image: gloves1 },
  { name: "Pants", href: "/category/riding-gears?type=pants", image: helmet2 },
  { name: "Boots", href: "/category/riding-gears?type=boots", image: helmet3 },
  { name: "Communication", href: "/category/helmet-accessories?type=intercoms", image: intercom1 },
  { name: "Luggage", href: "/category/motorcycle-accessories?type=luggage", image: visor1 },
  { name: "Accessories", href: "/category/motorcycle-accessories", image: gloves1 },
];

const CategoryCard = ({ category }: { category: CategoryItem }) => (
  <Link
    to={category.href}
    className="relative block aspect-square overflow-hidden group"
  >
    <img
      src={category.image}
      alt={category.name}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
    
    {/* Category name */}
    <div className="absolute inset-0 flex items-end justify-center pb-6">
      <span className="text-base md:text-lg lg:text-xl font-bold text-foreground tracking-wider uppercase">
        {category.name}
      </span>
    </div>

    {/* Hover effect line */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
  </Link>
);

const CategoryGrid = () => {
  return (
    <section className="py-0">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-border">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
