import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const WarrantyPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 pt-0 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-center text-black tracking-wide mb-4 uppercase">
              Warranty Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
              <p>
                Each product/brand has a specific warranty policy which can be found under the "Warranty" section on that specific product page at helmethub.com.
              </p>
              
              <h2 className="text-xl font-semibold text-destructive mt-10 mb-4">
                Warranty Terms & Conditions: General
              </h2>
              
              <ul className="list-disc list-inside space-y-3 text-gray-700">
                <li>Each brand has a specific warranty duration, found under the "Warranty" section on the product page at helmethub.com.</li>
                <li>Warranty applies only to products bought at full MRP from Helmet Hub exclusive stores, authorized dealers, or helmethub.com.</li>
                <li>Products purchased under discounts or offers are not covered under warranty.</li>
                <li>Accessories are not covered under warranty.</li>
                <li>The warranty covers manufacturing defects only. Any issue or damage due to wear and tear, misuse, alterations, damage from use, etc are not covered under warranty.</li>
                <li>Purchasing a product from Helmet Hub means agreeing to our warranty terms. Ignorance of our warranty terms is not grounds for any claims.</li>
                <li>Warranty policy may change without notice.</li>
              </ul>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-destructive mb-4">How to Claim Warranty</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Contact our support team with your order details</li>
                  <li>Provide clear photos of the defect</li>
                  <li>Our team will review and respond within 48 hours</li>
                  <li>If approved, you'll receive instructions for product return</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default WarrantyPolicyPage;
