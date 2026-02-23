import { useParams, Link, useNavigate } from "react-router-dom";
import { goBack } from "@/lib/navigation";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { blogPosts as staticBlogPosts } from "@/data/blogPosts";
import { useBlogPost, useBlogPosts } from "@/hooks/useBlogPosts";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Try to fetch from database first
  const { data: dbPost, isLoading } = useBlogPost(slug);
  const { data: dbPosts = [] } = useBlogPosts();
  
  // Fall back to static post if not found in DB
  const staticPost = staticBlogPosts.find((p) => p.slug === slug);
  
  // Transform DB post to match static format
  const post = dbPost 
    ? {
        id: dbPost.id,
        slug: dbPost.slug,
        title: dbPost.title,
        excerpt: dbPost.excerpt,
        content: dbPost.content,
        image: dbPost.image_url || '/placeholder.svg',
        date: new Date(dbPost.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        category: dbPost.category,
      }
    : staticPost;

  // Get related posts (from DB or static)
  const allPosts = dbPosts.length > 0 
    ? dbPosts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        image: p.image_url || '/placeholder.svg',
        date: new Date(p.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
      }))
    : staticBlogPosts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        image: p.image,
        date: p.date,
      }));

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
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
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  // Not found
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
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
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <Link to="/blog" className="text-primary hover:underline">
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title={post.title}
        description={post.excerpt?.slice(0, 155) || `Read "${post.title}" on the Helmet Hub blog.`}
        ogImage={post.image || undefined}
        path={`/blog/${slug}`}
        type="article"
      />
      <Header />
      
      <main className="flex-1 pt-0 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <article>
              <header className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-destructive uppercase tracking-wide">
                    {post.category}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-normal text-navy-900 tracking-wide mb-4">
                  {post.title}
                </h1>
                <p className="text-gray-600 text-lg">{post.excerpt}</p>
              </header>

              {/* Featured Image */}
              <div className="aspect-video rounded-lg overflow-hidden mb-8">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                {post.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h2 key={index} className="text-xl font-semibold text-destructive mt-8 mb-4">
                        {paragraph.replace(/\*\*/g, '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('*') && !paragraph.startsWith('**')) {
                    return (
                      <p key={index} className="italic text-gray-700">
                        {paragraph.replace(/\*/g, '')}
                      </p>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                    return (
                      <ul key={index} className="list-disc list-inside space-y-1 text-gray-700 my-4">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className="mb-4">
                      {paragraph.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                  );
                })}
              </div>

            </article>

            {/* Related Posts */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">More Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allPosts
                  .filter((p) => p.id !== post.id)
                  .slice(0, 2)
                  .map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{relatedPost.date}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPostPage;
