import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Clock } from "lucide-react";

const stores = [
  {
    id: "gachibowli",
    storeName: "HELMET HUB",
    branchName: "Gachibowli Branch",
    address: "1st Floor, Besides Little Gon, Opp. Omega Hospital, Telecom Nagar, Gachibowli",
    city: "Hyderabad - 500033",
    state: "Telangana",
    phone: "+91 7842646888",
    timing: "10:00 AM - 9:00 PM",
    mapUrl: "https://maps.google.com/?q=Telecom+Nagar+Gachibowli+Hyderabad",
  },
  {
    id: "kondapur",
    storeName: "HELMET HUB",
    branchName: "Kondapur Branch",
    address: "1st Floor, Above Baskin Robbins, Next to Chirec School, Sriram Nagar, Kondapur",
    city: "Hyderabad - 500084",
    state: "Telangana",
    phone: "+91 9063880550",
    timing: "10:00 AM - 9:00 PM",
    mapUrl: "https://maps.google.com/?q=Sriram+Nagar+Kondapur+Hyderabad",
  },
];

const StoreLocatorPage = () => {
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
            {/* Region Header */}
            <div className="bg-secondary px-6 py-4 rounded-t-lg border border-border">
              <h2 className="text-lg font-bold text-foreground">Telangana</h2>
            </div>
            
            {/* City Header */}
            <div className="bg-card px-6 py-3 border-x border-border">
              <h3 className="font-semibold text-foreground">Hyderabad</h3>
            </div>

            {/* Store Cards */}
            <div className="border border-t-0 border-border rounded-b-lg overflow-hidden divide-y divide-border">
              {stores.map((store) => (
                <div key={store.id} className="p-6 bg-background hover:bg-secondary/30 transition-colors">
                  <h3 className="text-lg mb-3">
                    <span className="text-primary font-black italic tracking-wide">{store.storeName}</span>
                    <span className="text-muted-foreground font-medium text-base ml-2">– {store.branchName}</span>
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{store.address},</p>
                        <p>{store.city}.</p>
                        <p>{store.state}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-primary flex-shrink-0" />
                      <a 
                        href={`tel:${store.phone}`} 
                        className="hover:text-primary transition-colors"
                      >
                        Contact: {store.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-primary flex-shrink-0" />
                      <p>Timing: {store.timing}</p>
                    </div>
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-primary hover:text-accent underline underline-offset-2"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoreLocatorPage;
