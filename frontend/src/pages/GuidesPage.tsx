import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  publishedAt: string;
  author: { id: string; username: string };
}

export default function GuidesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const baseUrl = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : `${window.location.protocol}//${window.location.hostname}:4567`);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const response = await fetch(`${baseUrl}/api/public/posts/${slug}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentPost(data.data);
          } else {
            setCurrentPost(null);
          }
        } else {
          const response = await fetch(`${baseUrl}/api/public/posts`);
          const data = await response.json();
          setPosts(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, baseUrl]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">API Marketplace</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/models" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Models & Pricing</Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
                  Dashboard
                </Link>
              ) : (
                <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : slug && currentPost ? (
          /* Single Post View */
          <article>
            <Link to="/guides" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
              ← Back to Guides
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mb-8">
              <span>By {currentPost.author.username}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(currentPost.publishedAt)}</span>
            </div>
            {currentPost.coverImage && (
              <img src={currentPost.coverImage} alt={currentPost.title} className="w-full rounded-xl mb-8" />
            )}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: currentPost.content || '' }}
            />
          </article>
        ) : slug && !currentPost ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
            <Link to="/guides" className="text-primary-600 hover:underline">Back to Guides</Link>
          </div>
        ) : (
          /* Posts List */
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guides & Documentation</h1>
            <p className="text-lg text-gray-600 mb-8">Learn how to use our API effectively.</p>
            
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <p className="text-gray-500">No guides available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/guides/${post.slug}`} 
                    className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-6">
                      {post.coverImage && (
                        <img src={post.coverImage} alt={post.title} className="w-48 h-32 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600">{post.title}</h2>
                        {post.excerpt && <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>}
                        <div className="text-sm text-gray-500">
                          <span>{post.author.username}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

