import { useNavigate } from "react-router-dom";
import { goBack } from "@/lib/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useContentPage } from "@/hooks/useContentPages";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Static fallback content
const STATIC_CONTENT = `
<p>Each product/brand has a specific warranty policy which can be found under the "Warranty" section on that specific product page at <a href="https://www.helmethub.in" target="_blank" rel="noopener noreferrer">www.helmethub.in</a>.</p>

<h2>Warranty Terms & Conditions: General</h2>

<ul>
  <li>Each brand has a specific warranty duration, found under the "Warranty" section on the product page at <a href="https://www.helmethub.in" target="_blank" rel="noopener noreferrer">www.helmethub.in</a>.</li>
  <li>Warranty applies only to products bought at full MRP from Helmet Hub exclusive stores, authorized dealers, or <a href="https://www.helmethub.in" target="_blank" rel="noopener noreferrer">www.helmethub.in</a>.</li>
  <li>Products purchased under discounts or offers are not covered under warranty.</li>
  <li>Accessories are not covered under warranty.</li>
  <li>The warranty covers manufacturing defects only. Any issue or damage due to wear and tear, misuse, alterations, damage from use, etc are not covered under warranty.</li>
  <li>Purchasing a product from Helmet Hub means agreeing to our warranty terms. Ignorance of our warranty terms is not grounds for any claims.</li>
  <li>Warranty policy may change without notice.</li>
</ul>

<div class="mt-12 pt-8 border-t border-gray-200">
  <h2>How to Claim Warranty</h2>
  <ol>
    <li>Contact our support team with your order details</li>
    <li>Provide clear photos of the defect</li>
    <li>Our team will review and respond within 48 hours</li>
    <li>If approved, you'll receive instructions for product return</li>
  </ol>
</div>
`;

const WarrantyPolicyPage = () => {
  const navigate = useNavigate();
  const { data: dbContent, isLoading } = useContentPage("warranty-policy");

  const title = dbContent?.title || "Warranty Policy";
  const content = dbContent?.content || STATIC_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack(navigate)}
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

export default WarrantyPolicyPage;
