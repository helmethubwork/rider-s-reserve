import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/BlogCard";
import { blogPosts as staticBlogPosts } from "@/data/blogPosts";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Loader2 } from "lucide-react";

const BlogPage = () => {
  const { data: dbPosts, isLoading } = useBlogPosts();
  
  // Use database posts if available, otherwise fall back to static posts
  const posts = dbPosts && dbPosts.length > 0 
    ? dbPosts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image_url || '/placeholder.svg',
        date: new Date(post.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        category: post.category,
      }))
    : staticBlogPosts;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-0 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-navy-900 tracking-wide uppercase">
              Everything Motorcycling
            </h1>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Facts, tips & tricks about riding gear, safety, and the motorcycling lifestyle
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Blog Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
