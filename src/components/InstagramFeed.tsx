import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import helmet1 from "@/assets/products/helmet-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";

const instagramPosts = [
  { id: 1, image: helmet1 },
  { id: 2, image: helmet2 },
  { id: 3, image: helmet3 },
  { id: 4, image: visor1 },
  { id: 5, image: intercom1 },
];

const InstagramFeed = () => {
  const [startIndex, setStartIndex] = useState(0);

  const next = () => {
    setStartIndex((prev) => (prev + 1) % instagramPosts.length);
  };

  const prev = () => {
    setStartIndex((prev) => (prev - 1 + instagramPosts.length) % instagramPosts.length);
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-lg md:text-xl tracking-[0.3em] text-foreground mb-8">
          JOIN OUR INSTA STORY: <span className="text-primary">@HELMETHUB46</span>
        </h2>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-background/80 text-foreground hover:text-primary transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-primary text-primary-foreground hover:bg-accent transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href="https://www.instagram.com/helmethub46"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square overflow-hidden group"
              >
                <img
                  src={post.image}
                  alt={`Instagram post ${post.id}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
