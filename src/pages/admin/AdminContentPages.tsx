import { useState } from "react";
import { useAdminContentPages, useUpdateContentPage, useToggleContentPagePublished, useCreateContentPage } from "@/hooks/useContentPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, FileText, Edit, Eye, EyeOff, ExternalLink, Plus, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "./AdminLayout";

// Default content pages that should exist
const DEFAULT_PAGES = [
  {
    slug: "shipping-policy",
    title: "Shipping Policy",
    content: `<p>Helmet Hub offers domestic shipping on all orders. International shipping will be levied at actuals. Domestic buyers please note that your order will be shipped within 3 working days of orders placed through registered domestic courier companies or speed post only. Helmet Hub cannot be held responsible for any delivery delays caused by the courier company. Helmet Hub only guarantees to handover the order to the courier company or postal office within 3 working days from the date of the order.</p>

<p>Helmet Hub isn't liable if any damage is caused to the product during transit. Customers are advised not to accept the order if the package is damaged or has been tampered with.</p>

<h2>Delivery Timeline</h2>
<ul>
  <li>Metro cities: 3-5 business days</li>
  <li>Other cities: 5-7 business days</li>
  <li>Remote areas: 7-10 business days</li>
</ul>

<h2>Tracking Your Order</h2>
<h2>Delivery Charges</h2>
<ul>
  <li>Free delivery on eligible orders (if applicable)</li>
  <li>Standard shipping charges may apply depending on location</li>
  <li>Final delivery charges are shown at checkout before payment confirmation</li>
</ul>

<h2>Tracking Your Order</h2>
<p>Once your order is shipped, you will receive a tracking number via email and SMS. You can use this tracking number to monitor the status of your delivery on our Track Orders page.</p>`,
    meta_description: "Helmet Hub shipping policy - delivery timelines, tracking information, and shipping terms.",
  },
  {
    slug: "exchange-returns",
    title: "Exchange, Returns, Refund & Cancellation Policy",
    content: `<h2>Exchange Policy:</h2>
<p>Your favorite gear purchased from us doesn't fit well? No problem, we are happy to exchange it for the right size.</p>
<ul>
  <li>Please note that products purchased can be exchanged for size only. Product must be unused with all the tags and packing material must be intact. Products sent without proper packaging and without the helmet box and tags will be returned to the customer as is.</li>
  <li>Customer must fill the form below and then ship the product within 48hrs of receiving the product.</li>
  <li>Please ship the product to the address mentioned in the invoice received with the product.</li>
  <li>The cost of sending the product will be compensated to the customer in the form of store credit only at actuals but upto a maximum of Rs. 500. No cash compensation will be made.</li>
  <li>Helmet Hub will send the replacement free of cost.</li>
</ul>
<p><strong>* Please note that products that are on sale or purchased using a discount, luggage and all accessories cannot be exchanged.*</strong></p>
<p>*The Store credit issued to the customer must be used within 30 days. The credit won't be reissued once it has expired.</p>
<p>*The Store credit can be used only on specific collections like helmets, jackets, gloves, pants, boots, intercoms and luggage. It cannot be used to buy accessories.</p>
<p>*The store credit for the shipping cost will be issued after the exchanged item is shipped. It is the customer's responsibility to send the shipping invoice to us within 7 days of the exchange to get the store credit. Store credit will not be issued if we do not get the shipping invoice within 7 days of the exchange.</p>

<h2>Returns & Refund Policy:</h2>
<p>Products once purchased can only be exchanged. They cannot be returned claiming for a refund. If the replacement product is not available in the requested size, customer must choose another model. If that is also not available, then a refund will be issued as store credit according to our policy. Refund timelines depend on approval and processing conditions. The store credit will be valid for 30 days only.</p>

<h2>Cancellation Policy:</h2>
<p>We start processing the orders soon after receiving them. Hence, orders once placed cannot be cancelled.</p>`,
    meta_description: "Helmet Hub exchange, returns, refund and cancellation policy.",
  },
  {
    slug: "warranty-policy",
    title: "Warranty Policy",
    content: `<p>Each product/brand has a specific warranty policy which can be found under the "Warranty" section on that specific product page at <a href="https://www.helmethub.in">www.helmethub.in</a>.</p>

<h2>Warranty Terms & Conditions: General</h2>
<ul>
  <li>Each brand has a specific warranty duration, found under the "Warranty" section on the product page at <a href="https://www.helmethub.in">www.helmethub.in</a>.</li>
  <li>Warranty applies only to products bought at full MRP from Helmet Hub exclusive stores, authorized dealers, or <a href="https://www.helmethub.in">www.helmethub.in</a>.</li>
  <li>Products purchased under discounts or offers are not covered under warranty.</li>
  <li>Accessories are not covered under warranty.</li>
  <li>The warranty covers manufacturing defects only. Any issue or damage due to wear and tear, misuse, alterations, damage from use, etc are not covered under warranty.</li>
  <li>Purchasing a product from Helmet Hub means agreeing to our warranty terms. Ignorance of our warranty terms is not grounds for any claims.</li>
  <li>Warranty policy may change without notice.</li>
</ul>

<h2>How to Claim Warranty</h2>
<ol>
  <li>Contact our support team with your order details</li>
  <li>Provide clear photos of the defect</li>
  <li>Our team will review and respond within 48 hours</li>
  <li>If approved, you'll receive instructions for product return</li>
</ol>`,
    meta_description: "Helmet Hub warranty policy - terms, conditions, and how to claim warranty.",
  },
];

const AdminContentPages = () => {
  const { data: pages, isLoading, error } = useAdminContentPages();
  const updatePage = useUpdateContentPage();
  const togglePublished = useToggleContentPagePublished();
  const createPage = useCreateContentPage();

  const [editingPage, setEditingPage] = useState<{
    id: string;
    slug: string;
    title: string;
    content: string;
    meta_description: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (page: { id: string; slug: string; title: string; content: string; meta_description: string | null }) => {
    setEditingPage({
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_description: page.meta_description || "",
    });
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    try {
      await updatePage.mutateAsync({
        id: editingPage.id,
        title: editingPage.title,
        content: editingPage.content,
        meta_description: editingPage.meta_description,
      });
      setEditingPage(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    await togglePublished.mutateAsync({ id, is_published: !currentStatus });
  };

  const handleSeedPage = async (defaultPage: typeof DEFAULT_PAGES[0]) => {
    await createPage.mutateAsync({
      slug: defaultPage.slug,
      title: defaultPage.title,
      content: defaultPage.content,
      meta_description: defaultPage.meta_description,
    });
  };

  const getPageUrl = (slug: string) => {
    const urlMap: Record<string, string> = {
      "shipping-policy": "/shipping-policy",
      "exchange-returns": "/exchange-returns",
      "warranty-policy": "/warranty-policy",
    };
    return urlMap[slug] || `/${slug}`;
  };

  // Check which default pages are missing
  const existingSlugs = pages?.map((p) => p.slug) || [];
  const missingPages = DEFAULT_PAGES.filter((dp) => !existingSlugs.includes(dp.slug));

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to load content pages</h3>
          <p className="text-muted-foreground mb-4">
            The content_pages table may not exist. Please create it in Supabase.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left max-w-2xl mx-auto">
            <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap">
{`CREATE TABLE public.content_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  meta_description text,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public can read published pages"
  ON public.content_pages FOR SELECT
  USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage content pages"
  ON public.content_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));`}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Pages</h2>
          <p className="text-muted-foreground">
            Manage policy and support page content
          </p>
        </div>
      </div>

      {/* Missing pages alert */}
      {missingPages.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-amber-800">Missing Pages</CardTitle>
            <CardDescription className="text-amber-700">
              The following pages need to be created. Click to seed with default content.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {missingPages.map((page) => (
              <Button
                key={page.slug}
                variant="outline"
                size="sm"
                onClick={() => handleSeedPage(page)}
                className="border-amber-300 hover:bg-amber-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create "{page.title}"
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Existing pages */}
      <div className="grid gap-4">
        {pages?.map((page) => (
          <Card key={page.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription>/{page.slug}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <Switch
                      checked={page.is_published}
                      onCheckedChange={() => handleTogglePublished(page.id, page.is_published)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {page.is_published ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Eye className="h-4 w-4" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <EyeOff className="h-4 w-4" /> Draft
                        </span>
                      )}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={getPageUrl(page.slug)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </a>
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleEdit(page)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {page.meta_description || "No description set"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(page.updated_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}

        {pages?.length === 0 && missingPages.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No content pages</h3>
            <p className="text-muted-foreground">
              Content pages will appear here once created.
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content Page</DialogTitle>
            <DialogDescription>
              Update the content for "{editingPage?.title}"
            </DialogDescription>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={editingPage.title}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                <Input
                  id="meta_description"
                  value={editingPage.meta_description}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      meta_description: e.target.value,
                    })
                  }
                  placeholder="Brief description for search engines"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Page Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={editingPage.content}
                  onChange={(e) =>
                    setEditingPage({ ...editingPage, content: e.target.value })
                  }
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter HTML content..."
                />
                <p className="text-xs text-muted-foreground">
                  Use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingPage(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContentPages;
