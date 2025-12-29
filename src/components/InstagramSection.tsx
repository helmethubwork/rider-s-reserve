import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstagramSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Follow Us On Insta</h2>
          <p className="text-muted-foreground">Join our community of riders</p>
        </div>

        {/* Instagram Grid Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-card rounded-lg overflow-hidden group cursor-pointer relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Instagram size={32} className="text-primary/50" />
              </div>
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Instagram size={32} className="text-foreground" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://www.instagram.com/helmethub46"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Instagram size={20} />
              @helmethub46
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
