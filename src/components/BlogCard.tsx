import { Link } from "react-router-dom";
import { BlogPost } from "@/data/blogPosts";

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium text-destructive uppercase tracking-wide">
              {post.category}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{post.date}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:text-destructive transition-colors">
            Read More
            <svg
              className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
