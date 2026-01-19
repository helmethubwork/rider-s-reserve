import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Clock, Star } from "lucide-react";
import { useStoreLocations } from "@/hooks/useStoreLocations";
import { Skeleton } from "@/components/ui/skeleton";

const StoreLocatorPage = () => {
  const { data: stores, isLoading, error } = useStoreLocations(true);

  // Group stores by state and city
  const groupedStores = stores?.reduce((acc, store) => {
    const state = store.state || 'Other';
    const city = store.city || 'Other';
    if (!acc[state]) acc[state] = {};
    if (!acc[state][city]) acc[state][city] = [];
    acc[state][city].push(store);
    return acc;
  }, {} as Record<string, Record<string, typeof stores>>) || {};

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow pt-0 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-center">
            Store Locator
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Visit our stores to explore our premium collection of helmets and riding gear
          </p>

          <div className="max-w-4xl mx-auto">
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-t-lg" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full rounded-b-lg" />
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-destructive">
                Failed to load store locations. Please try again later.
              </div>
            )}

            {!isLoading && !error && stores?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No store locations available at the moment.
              </div>
            )}

            {Object.entries(groupedStores).map(([state, cities]) => (
              <div key={state} className="mb-6">
                {/* Region Header */}
                <div className="bg-secondary px-6 py-4 rounded-t-lg border border-border">
                  <h2 className="text-lg font-bold text-foreground">{state}</h2>
                </div>

                {Object.entries(cities).map(([city, cityStores], cityIndex) => (
                  <div key={city}>
                    {/* City Header */}
                    <div className="bg-card px-6 py-3 border-x border-border">
                      <h3 className="font-semibold text-foreground">{city}</h3>
                    </div>

                    {/* Store Cards */}
                    <div className={`border border-t-0 border-border ${cityIndex === Object.keys(cities).length - 1 ? 'rounded-b-lg' : ''} overflow-hidden divide-y divide-border`}>
                      {cityStores?.map((store) => (
                        <div key={store.id} className="p-6 bg-background hover:bg-secondary/30 transition-colors">
                          <h3 className="text-lg mb-3 flex items-baseline flex-wrap gap-x-2">
                            <span className="inline-flex items-baseline">
                              <span className="text-primary font-black italic tracking-tight" style={{ letterSpacing: '-0.02em' }}>HELMET</span>
                              <span className="text-foreground font-black italic tracking-tight ml-1" style={{ letterSpacing: '-0.02em' }}>HUB</span>
                            </span>
                            <span className="text-muted-foreground font-medium text-base">– {store.name}</span>
                            {store.is_main_branch && (
                              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                <Star size={12} className="fill-primary" />
                                Main Branch
                              </span>
                            )}
                          </h3>
                          <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-start gap-3">
                              <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <p>{store.address},</p>
                                <p>{store.city} - {store.pincode}.</p>
                                <p>{store.state}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone size={18} className="text-primary flex-shrink-0" />
                              <div className="flex flex-wrap gap-x-4">
                                <a 
                                  href={`tel:${store.phone_primary}`} 
                                  className="hover:text-primary transition-colors"
                                >
                                  Contact: {store.phone_primary}
                                </a>
                                {store.phone_secondary && (
                                  <a 
                                    href={`tel:${store.phone_secondary}`} 
                                    className="hover:text-primary transition-colors"
                                  >
                                    {store.phone_secondary}
                                  </a>
                                )}
                              </div>
                            </div>
                            {store.opening_hours && (
                              <div className="flex items-center gap-3">
                                <Clock size={18} className="text-primary flex-shrink-0" />
                                <p>Timing: {store.opening_hours}</p>
                              </div>
                            )}
                            {store.map_url && (
                              <a
                                href={store.map_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-3 text-sm text-primary hover:text-accent underline underline-offset-2"
                              >
                                Get Directions →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoreLocatorPage;
