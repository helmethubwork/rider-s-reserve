const brands = [
  { name: "AGV", logo: "AGV" },
  { name: "HJC", logo: "HJC" },
  { name: "Shoei", logo: "SHOEI" },
  { name: "Arai", logo: "ARAI" },
  { name: "LS2", logo: "LS2" },
  { name: "MT", logo: "MT" },
  { name: "Korda", logo: "KORDA" },
  { name: "Alpinestars", logo: "ALPINESTARS" },
];

const BrandShowcase = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-wider mb-2">
            BRANDS WE DEAL IN
          </h2>
          <p className="text-muted-foreground">Trusted brands for quality products</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center p-4 md:p-6 bg-card border border-border hover:border-primary transition-all duration-300 group cursor-pointer"
            >
              <span className="text-sm md:text-base font-bold text-muted-foreground group-hover:text-primary transition-colors tracking-wide">
                {brand.logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
