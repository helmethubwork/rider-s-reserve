import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MapPin, Phone, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const stores = [
  {
    id: "gachibowli",
    name: "Gachibowli Branch",
    address: "1st Floor, Besides Little Gon, Opp. Omega Hospital, Telecom Nagar, Gachibowli",
    city: "Hyderabad - 500033",
    state: "Telangana",
    phone: "+91 9876543210",
    timing: "10:00 AM - 9:00 PM",
    mapUrl: "https://maps.google.com/?q=Telecom+Nagar+Gachibowli+Hyderabad",
  },
  {
    id: "kondapur",
    name: "Kondapur Branch",
    address: "1st Floor, Above Baskin Robbins, Next to Chirec School, Sriram Nagar, Kondapur",
    city: "Hyderabad - 500084",
    state: "Telangana",
    phone: "+91 9876543211",
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
            <Accordion type="single" collapsible defaultValue="telangana" className="w-full">
              <AccordionItem value="telangana" className="border border-border rounded-lg overflow-hidden mb-4">
                <AccordionTrigger className="px-6 py-4 bg-secondary hover:bg-secondary/80 text-lg font-bold">
                  Telangana
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <Accordion type="single" collapsible defaultValue="hyderabad" className="w-full">
                    <AccordionItem value="hyderabad" className="border-0 border-t border-border">
                      <AccordionTrigger className="px-6 py-4 bg-card hover:bg-card/80 font-semibold">
                        Hyderabad
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-0">
                        <div className="divide-y divide-border">
                          {stores.map((store) => (
                            <div key={store.id} className="p-6 bg-background hover:bg-secondary/30 transition-colors">
                              <h3 className="text-primary font-bold text-lg mb-3 italic">
                                {store.name}
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
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StoreLocatorPage;
