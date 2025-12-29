import { Link } from "react-router-dom";
import helmet1 from "@/assets/products/helmet-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";
import gloves1 from "@/assets/products/gloves-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";

interface CategoryItem {
  name: string;
  href: string;
  image: string;
  size: "large" | "small";
}

const categories: CategoryItem[] = [
  { name: "HELMETS", href: "/category/helmets", image: helmet1, size: "large" },
  { name: "JACKETS", href: "/category/riding-gears?type=jackets", image: jacket1, size: "large" },
  { name: "BOOTS", href: "/category/riding-gears?type=boots", image: gloves1, size: "small" },
  { name: "COMMUNICATION", href: "/category/helmet-accessories?type=intercoms", image: intercom1, size: "small" },
];

const CategoryCard = ({ category }: { category: CategoryItem }) => (
  <Link
    to={category.href}
    className="category-card relative block aspect-[4/5] overflow-hidden group"
  >
    <img
      src={category.image}
      alt={category.name}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-[0.2em]">
        {category.name}
      </span>
    </div>
  </Link>
);

const CategoryGrid = () => {
  return (
    <section className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
