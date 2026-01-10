import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Package, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ExchangeReturnsPage = () => {
  const { toast } = useToast();
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
    alternateProduct3: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Request Submitted",
      description: "We'll review your exchange request and get back to you within 48 hours.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-normal text-center text-navy-900 tracking-wide mb-12 md:mb-16 uppercase">
              Exchange, Returns & Cancellation
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6 mb-16">
              <h2 className="text-xl font-semibold text-primary">Exchange Policy</h2>
              <p>
                We offer size exchanges within 7 days of delivery. Products must be unused, unworn, with all original tags and packaging intact.
              </p>

              <h2 className="text-xl font-semibold text-primary mt-8">Returns Policy</h2>
              <p>
                Returns are accepted within 7 days of delivery for manufacturing defects only. Products on sale or purchased with discounts are not eligible for returns.
              </p>

              <h2 className="text-xl font-semibold text-primary mt-8">Cancellation Policy</h2>
              <p>
                Orders can be cancelled within 24 hours of placing the order. Once shipped, cancellation is not possible.
              </p>
            </div>

            {/* Exchange Request Form */}
            <div className="bg-gray-50 rounded-lg p-8 md:p-12 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-serif text-center text-navy-900 mb-8">
                Product Exchange Request Form
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                        className="bg-white border-gray-300 pl-10"
                      />
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
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="bg-white border-gray-300 flex-1"
                      />
                    </div>
                  </div>

                  {/* Order Number */}
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber" className="text-gray-700">
                      Order Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="orderNumber"
                      value={formData.orderNumber}
                      onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Product Type */}
                  <div className="space-y-2">
                    <Label className="text-gray-700">
                      Product Type <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("productType", value)}>
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
                    <Input
                      id="originalProduct"
                      value={formData.originalProduct}
                      onChange={(e) => handleInputChange("originalProduct", e.target.value)}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Product Color */}
                  <div className="space-y-2">
                    <Label htmlFor="productColor" className="text-gray-700">
                      Product Color <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="productColor"
                      value={formData.productColor}
                      onChange={(e) => handleInputChange("productColor", e.target.value)}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>

                  {/* Size Ordered */}
                  <div className="space-y-2">
                    <Label htmlFor="sizeOrdered" className="text-gray-700">
                      Size Ordered <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sizeOrdered"
                      value={formData.sizeOrdered}
                      onChange={(e) => handleInputChange("sizeOrdered", e.target.value)}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Size Needed */}
                <div className="space-y-2">
                  <Label htmlFor="sizeNeeded" className="text-gray-700">
                    Size Needed in Exchange <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sizeNeeded"
                    value={formData.sizeNeeded}
                    onChange={(e) => handleInputChange("sizeNeeded", e.target.value)}
                    required
                    className="bg-white border-gray-300"
                  />
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
                  
                  <Input
                    placeholder="Option 1"
                    value={formData.alternateProduct1}
                    onChange={(e) => handleInputChange("alternateProduct1", e.target.value)}
                    className="bg-white border-gray-300"
                  />
                  <Input
                    placeholder="Option 2"
                    value={formData.alternateProduct2}
                    onChange={(e) => handleInputChange("alternateProduct2", e.target.value)}
                    className="bg-white border-gray-300"
                  />
                  <Input
                    placeholder="Option 3"
                    value={formData.alternateProduct3}
                    onChange={(e) => handleInputChange("alternateProduct3", e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>

                {/* Invoice Upload */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Invoice</Label>
                  <p className="text-sm text-gray-500">The max file size is 10MB.</p>
                  <div className="mt-2">
                    <Button type="button" variant="outline" className="w-full md:w-auto bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    className="px-12 py-3 bg-pink-400 hover:bg-pink-500 text-white font-medium"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExchangeReturnsPage;
