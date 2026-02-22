import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useContentPage } from "@/hooks/useContentPages";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Static fallback content
const STATIC_CONTENT = `
<p>Helmet Hub offers domestic shipping on all orders. International shipping will be levied at actuals. Domestic buyers please note that your order will be shipped within 3 working days of orders placed through registered domestic courier companies or speed post only. Helmet Hub cannot be held responsible for any delivery delays caused by the courier company. Helmet Hub only guarantees to handover the order to the courier company or postal office within 3 working days from the date of the order.</p>

<p>Helmet Hub isn't liable if any damage is caused to the product during transit. Customers are advised not to accept the order if the package is damaged or has been tampered with.</p>

<div class="mt-12 pt-8 border-t border-gray-200">
  <h2>Delivery Timeline</h2>
  <ul>
    <li>Metro cities: 3-5 business days</li>
    <li>Other cities: 5-7 business days</li>
    <li>Remote areas: 7-10 business days</li>
  </ul>
</div>

<div class="mt-8">
  <h2>Delivery Charges</h2>
  <ul>
    <li>Free delivery on eligible orders (if applicable)</li>
    <li>Standard shipping charges may apply depending on location</li>
    <li>Final delivery charges are shown at checkout before payment confirmation</li>
  </ul>
</div>

<div class="mt-8">
  <h2>Tracking Your Order</h2>
  <p>Once your order is shipped, you will receive a tracking number via email and SMS. You can use this tracking number to monitor the status of your delivery on our Track Orders page.</p>
</div>
`;

const ShippingPolicyPage = () => {
  const navigate = useNavigate();
  const { data: dbContent, isLoading } = useContentPage("shipping-policy");

  const title = dbContent?.title || "Shipping Policy";
  const content = dbContent?.content || STATIC_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-foreground hover:text-primary"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <main className="flex-1 pt-4 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-center text-foreground tracking-wide mb-4 uppercase">
              {title}
            </h1>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div 
                className="prose prose-lg max-w-none text-foreground leading-relaxed space-y-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-primary [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ul]:text-muted-foreground [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-2 [&_ol]:text-muted-foreground [&_p]:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShippingPolicyPage;