import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Package, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useContentPage } from "@/hooks/useContentPages";

// Static fallback content for the policy section
const STATIC_POLICY_CONTENT = `
<div>
  <h2 class="text-lg font-bold text-black mb-3">Exchange Policy:</h2>
  <p class="mb-4">Your favorite gear purchased from us doesn't fit well? No problem, we are happy to exchange it for the right size.</p>
  <ul class="list-disc pl-6 space-y-2 text-gray-700">
    <li>Please note that products purchased can be exchanged for size only. Product must be unused with all the tags and packing material must be intact. Products sent without proper packaging and without the helmet box and tags will be returned to the customer as is.</li>
    <li>Customer must fill the form below and then ship the product within 48hrs of receiving the product.</li>
    <li>Please ship the product to the address mentioned in the invoice received with the product.</li>
    <li>The cost of sending the product will be compensated to the customer in the form of store credit only at actuals but upto a maximum of Rs. 500. No cash compensation will be made.</li>
    <li>Helmet Hub will send the replacement free of cost.</li>
  </ul>
  <p class="text-black mt-4">* Please note that products that are on sale or purchased using a discount, luggage and all accessories cannot be exchanged.*</p>
  <p class="text-black mt-3">*The Store credit issued to the customer must be used within 30 days. The credit won't be reissued once it has expired.</p>
  <p class="text-black mt-3">*The Store credit can be used only on specific collections like helmets, jackets, gloves, pants, boots, intercoms and luggage. It cannot be used to buy accessories.</p>
  <p class="text-black mt-3">*The store credit for the shipping cost will be issued after the exchanged item is shipped. It is the customer's responsibility to send the shipping invoice to us within 7 days of the exchange to get the store credit. Store credit will not be issued if we do not get the shipping invoice within 7 days of the exchange.</p>
</div>

<div>
  <h2 class="text-lg font-bold text-black mb-3">Returns & Refund Policy:</h2>
  <p>Products once purchased can only be exchanged. They cannot be returned claiming for a refund. If the replacement product is not available in the requested size, customer must choose another model. If that is also not available, then a refund will be made only in the form of store credit which will be valid for 30 days only. Company will not make a cash refund under any circumstances.</p>
</div>

<div>
  <h2 class="text-lg font-bold text-black mb-3">Cancellation Policy:</h2>
  <p>We start processing the orders soon after receiving them. Hence, orders once placed cannot be cancelled.</p>
</div>
`;

const ExchangeReturnsPage = () => {
  const { data: dbContent, isLoading: isLoadingContent } = useContentPage("exchange-returns");
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    orderNumber: "",
    productType: "",
    originalProduct: "",
    productColor: "",
    sizeOrdered: "",
    sizeNeeded: "",
    alternateProduct1: "",
    alternateProduct2: "",
    alternateProduct3: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {
        supabase
      } = await import("@/lib/supabase");
      const {
        error
      } = await supabase.from("return_requests").insert({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        order_number: formData.orderNumber.trim(),
        product_type: formData.productType,
        original_product: formData.originalProduct.trim(),
        product_color: formData.productColor.trim(),
        size_ordered: formData.sizeOrdered.trim(),
        size_needed: formData.sizeNeeded.trim(),
        alternate_products: [formData.alternateProduct1, formData.alternateProduct2, formData.alternateProduct3].filter(Boolean)
      });
      if (error) throw error;
      toast({
        title: "Request Submitted",
        description: "We'll review your exchange request and get back to you within 48 hours."
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        orderNumber: "",
        productType: "",
        originalProduct: "",
        productColor: "",
        sizeOrdered: "",
        sizeNeeded: "",
        alternateProduct1: "",
        alternateProduct2: "",
        alternateProduct3: ""
      });
    } catch (error) {
      console.error("Return request error:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const title = dbContent?.title || "Exchange, Returns, Refund & Cancellation Policy";
  const policyContent = dbContent?.content || STATIC_POLICY_CONTENT;

  return <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 pt-0 pb-4">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-center text-black tracking-wide mb-6 uppercase">
              {title}
            </h1>
            
            {isLoadingContent ? (
              <div className="flex justify-center py-12 mb-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div 
                className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6 mb-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-black [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:text-gray-700"
                dangerouslySetInnerHTML={{ __html: policyContent }}
              />
            )}

            <div className="bg-gray-50 rounded-lg p-6 md:p-8 border border-gray-200">
              <h2 className="text-xl md:text-2xl font-serif text-center text-navy-900 mb-6">
                Product Exchange Request Form
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input id="fullName" value={formData.fullName} onChange={e => handleInputChange("fullName", e.target.value)} required className="bg-white border-gray-300" />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required className="bg-white border-gray-300 pl-10" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-white border border-gray-300 rounded-md">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 text-sm">+91</span>
                      </div>
                      <Input id="phone" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} required className="bg-white border-gray-300 flex-1" />
                    </div>
                  </div>

                  {/* Order Number */}
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber" className="text-gray-700">
                      Order Number <span className="text-red-500">*</span>
                    </Label>
                    <Input id="orderNumber" value={formData.orderNumber} onChange={e => handleInputChange("orderNumber", e.target.value)} required className="bg-white border-gray-300" />
                  </div>

                  {/* Product Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">
                      Product Type <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={value => handleInputChange("productType", value)}>
                      <SelectTrigger className="bg-white border-gray-300">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <SelectValue placeholder="Please select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helmet">Helmet</SelectItem>
                        <SelectItem value="jacket">Jacket</SelectItem>
                        <SelectItem value="gloves">Gloves</SelectItem>
                        <SelectItem value="boots">Boots</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Original Product */}
                  <div className="space-y-2">
                    <Label htmlFor="originalProduct" className="text-gray-700">
                      Original Product Ordered <span className="text-red-500">*</span>
                    </Label>
                    <Input id="originalProduct" value={formData.originalProduct} onChange={e => handleInputChange("originalProduct", e.target.value)} required className="bg-white border-gray-300" />
                  </div>

                  {/* Product Color */}
                  <div className="space-y-2">
                    <Label htmlFor="productColor" className="text-gray-700">
                      Product Color <span className="text-red-500">*</span>
                    </Label>
                    <Input id="productColor" value={formData.productColor} onChange={e => handleInputChange("productColor", e.target.value)} required className="bg-white border-gray-300" />
                  </div>

                  {/* Size Ordered */}
                  <div className="space-y-2">
                    <Label htmlFor="sizeOrdered" className="text-gray-700">
                      Size Ordered <span className="text-red-500">*</span>
                    </Label>
                    <Input id="sizeOrdered" value={formData.sizeOrdered} onChange={e => handleInputChange("sizeOrdered", e.target.value)} required className="bg-white border-gray-300" />
                  </div>
                </div>

                {/* Size Needed */}
                <div className="space-y-2">
                  <Label htmlFor="sizeNeeded" className="text-gray-700">
                    Size Needed in Exchange <span className="text-red-500">*</span>
                  </Label>
                  <Input id="sizeNeeded" value={formData.sizeNeeded} onChange={e => handleInputChange("sizeNeeded", e.target.value)} required className="bg-white border-gray-300" />
                </div>

                {/* Alternate Products */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-700">
                      Alternate Product <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      If the original product is not available in the required size, customers are requested to select another graphic or color from any other available product.
                    </p>
                  </div>
                  
                  <Input placeholder="Option 1" value={formData.alternateProduct1} onChange={e => handleInputChange("alternateProduct1", e.target.value)} className="bg-white border-gray-300" />
                  <Input placeholder="Option 2" value={formData.alternateProduct2} onChange={e => handleInputChange("alternateProduct2", e.target.value)} className="bg-white border-gray-300" />
                  <Input placeholder="Option 3" value={formData.alternateProduct3} onChange={e => handleInputChange("alternateProduct3", e.target.value)} className="bg-white border-gray-300" />
                </div>

                {/* Invoice Upload */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Invoice</Label>
                  <p className="text-sm text-gray-500">The max file size is 5 MB.</p>
                  <div className="mt-2">
                    <Button type="button" variant="outline" className="w-full md:w-auto bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-center pt-6">
                  <Button type="submit" className="px-12 py-3 bg-pink-400 hover:bg-pink-500 text-white font-medium">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default ExchangeReturnsPage;