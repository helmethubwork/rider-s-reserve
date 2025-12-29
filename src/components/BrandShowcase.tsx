const brands = [
  { name: "AGV", logo: "AGV" },
  { name: "HJC", logo: "HJC" },
  { name: "Shoei", logo: "SHOEI" },
  { name: "Arai", logo: "ARAI" },
  { name: "LS2", logo: "LS2" },
  { name: "MT", logo: "MT" },
];

const BrandShowcase = () => {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Brands We Deal In</h2>
          <p className="text-muted-foreground">Trusted brands for quality products</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center p-6 bg-card rounded-lg border border-border hover:border-primary transition-all duration-300 group cursor-pointer"
            >
              <span className="font-display text-xl md:text-2xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
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
