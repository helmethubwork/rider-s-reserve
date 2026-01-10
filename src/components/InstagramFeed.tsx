import helmet1 from "@/assets/products/helmet-1.jpg";
import helmet2 from "@/assets/products/helmet-2.jpg";
import helmet3 from "@/assets/products/helmet-3.jpg";
import visor1 from "@/assets/products/visor-1.jpg";
import intercom1 from "@/assets/products/intercom-1.jpg";
import jacket1 from "@/assets/products/jacket-1.jpg";

const instagramReels = [
  { id: 1, image: helmet1, reelId: "C-C3abzBKYd" },
  { id: 2, image: helmet2, reelId: "C6YW6r6LI9-" },
  { id: 3, image: helmet3, reelId: "DTNVmDwgTon" },
  { id: 4, image: visor1, reelId: "DRzgIPrjMNT" },
  { id: 5, image: intercom1, reelId: "DRUl9StDEsX" },
  { id: 6, image: jacket1, reelId: "DPngJf0Af1H" },
];

const InstagramFeed = () => {
  return (
    <section className="py-12 md:py-16 bg-black">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-center text-sm md:text-base tracking-[0.3em] text-white">
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

      {/* Horizontal Thumbnails Row */}
      <div className="flex overflow-x-auto gap-1 px-0 scrollbar-hide">
        {instagramReels.map((reel) => (
          <a
            key={reel.id}
            href={`https://www.instagram.com/reel/${reel.reelId}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[200px] md:w-[280px] lg:w-[320px] aspect-[9/16] overflow-hidden group relative"
          >
            <img
              src={reel.image}
              alt={`Instagram reel ${reel.id}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg 
                  className="w-6 h-6 text-black ml-1"
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            {/* Instagram icon */}
            <div className="absolute top-3 left-3">
              <svg 
                className="w-6 h-6 text-white drop-shadow-lg"
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <circle cx="12" cy="12" r="3.5"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
