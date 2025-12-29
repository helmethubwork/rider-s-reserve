import { Link } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

const CategoryCard = ({ name, image, href }: CategoryCardProps) => {
  return (
    <Link to={href} className="group block">
      <div className="category-frame bg-card overflow-hidden">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-xl md:text-2xl font-bold text-foreground uppercase tracking-wider border-b-2 border-foreground pb-1 transition-all group-hover:border-primary group-hover:text-primary">
              {name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
