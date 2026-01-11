import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/blogPosts";

const BlogPage = () => {
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

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
