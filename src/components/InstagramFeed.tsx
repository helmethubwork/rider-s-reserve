import helmet1 from "@/assets/products/helmet-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";

const instagramPosts = [
  { id: 1, image: helmet1, link: "https://www.instagram.com/reel/C-C3abzBKYd/" },
  { id: 2, image: helmet2, link: "https://www.instagram.com/reel/C6YW6r6LI9-/" },
  { id: 3, image: helmet3, link: "https://www.instagram.com/reel/DTNVmDwgTon/" },
  { id: 4, image: visor1, link: "https://www.instagram.com/reel/DRzgIPrjMNT/" },
  { id: 5, image: intercom1, link: "https://www.instagram.com/reel/DRUl9StDEsX/" },
  { id: 6, image: jacket1, link: "https://www.instagram.com/reel/DPngJf0Af1H/" },
];

const InstagramFeed = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-center text-sm md:text-base tracking-[0.3em] text-foreground">
          JOIN OUR INSTA STORY:{" "}
          <a 
            href="https://www.instagram.com/helmethub46" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @HELMETHUB46
          </a>
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
        {instagramPosts.map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-square overflow-hidden group relative"
          >
            <img
              src={post.image}
              alt={`Instagram reel ${post.id}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg 
                  className="w-5 h-5 md:w-6 md:h-6 text-foreground ml-1"
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
