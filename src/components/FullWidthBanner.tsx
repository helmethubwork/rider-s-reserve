import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-helmet.jpg";

interface BannerProps {
  subtitle?: string;
  title: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
}

const FullWidthBanner = ({
  subtitle,
  title,
  description,
  buttonText,
  buttonLink,
  image = heroImage,
}: BannerProps) => {
  return (
    <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-8 pb-16">
        {subtitle && (
          <p className="text-xs md:text-sm tracking-[0.3em] text-muted-foreground mb-3 uppercase">
            {subtitle}
          </p>
        )}
        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-foreground mb-3 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl">
            {description}
          </p>
        )}
        {buttonText && buttonLink && (
          <Link
            to={buttonLink}
            className="inline-flex items-center gap-2 border-2 border-foreground text-foreground font-bold px-8 py-3 text-sm tracking-[0.15em] hover:bg-foreground hover:text-background transition-all duration-300"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
};

export default FullWidthBanner;
