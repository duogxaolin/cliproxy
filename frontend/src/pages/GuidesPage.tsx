import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';

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
  const { t, language } = useTranslation();

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
    const locale = language === 'vi' ? 'vi-VN' : language === 'zh' ? 'zh-CN' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo to="/" />
            <div className="flex items-center space-x-4">
              <Link to="/models" className="text-gray-600 hover:text-gray-900 text-sm font-medium">{t.nav.modelsAndPricing}</Link>
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {t.nav.dashboard}
                </Link>
              ) : (
                <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-medium">
                  {t.nav.getStarted}
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
              {t.guides.backToGuides}
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{currentPost.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mb-8">
              <span>{t.guides.by} {currentPost.author.username}</span>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.guides.postNotFound}</h2>
            <Link to="/guides" className="text-primary-600 hover:underline">{t.guides.backToGuides}</Link>
          </div>
        ) : (
          /* Posts List */
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.guides.title}</h1>
            <p className="text-lg text-gray-600 mb-8">{t.guides.description}</p>

            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <p className="text-gray-500">{t.guides.noGuides}</p>
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

