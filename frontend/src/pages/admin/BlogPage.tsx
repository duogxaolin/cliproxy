import { useEffect, useState, useRef } from 'react';
import { UserLayout } from '../../components/layout';
import { Card, Button, Input, Badge, Spinner, Modal, ModalFooter } from '../../components/ui';
import { Editor } from '@tinymce/tinymce-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  author: { id: string; username: string };
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
}

const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: '', slug: '', excerpt: '', content: '', coverImage: '', isPublished: false,
  });
  const editorRef = useRef<unknown>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:3000' : `${window.location.protocol}//${window.location.hostname}:4567`);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  });

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/posts`, { headers: getAuthHeaders() });
      const data = await response.json();
      setPosts(data.data || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const resetForm = () => {
    setFormData({ title: '', slug: '', excerpt: '', content: '', coverImage: '', isPublished: false });
    setEditingPost(null);
  };

  const openCreateModal = () => { resetForm(); setShowModal(true); };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      coverImage: post.coverImage || '',
      isPublished: post.isPublished,
    });
    setShowModal(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = editingPost 
        ? `${baseUrl}/api/admin/posts/${editingPost.id}`
        : `${baseUrl}/api/admin/posts`;
      const method = editingPost ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      
      setShowModal(false);
      resetForm();
      loadPosts();
    } catch (err) {
      console.error('Failed to save post:', err);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await fetch(`${baseUrl}/api/admin/posts/${post.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      loadPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await fetch(`${baseUrl}/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      loadPosts();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return (
    <UserLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage guides and documentation.</p>
        </div>
        <Button onClick={openCreateModal}>+ New Post</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No posts yet.</p>
          <Button onClick={openCreateModal}>Create Your First Post</Button>
        </Card>
      ) : (
        <Card padding="none">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">/guides/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleTogglePublish(post)}>
                      <Badge variant={post.isPublished ? 'success' : 'default'}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(post)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(post)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create/Edit Modal with TinyMCE */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
        size="4xl"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter post title"
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="post-url-slug"
          />
          <Input
            label="Excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief description for listing"
          />
          <Input
            label="Cover Image URL"
            value={formData.coverImage}
            onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <Editor
              tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js"
              onInit={(_evt: unknown, editor: unknown) => editorRef.current = editor}
              value={formData.content}
              onEditorChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | code | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
              Publish immediately
            </label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingPost ? 'Update Post' : 'Create Post'}
          </Button>
        </ModalFooter>
      </Modal>
    </UserLayout>
  );
}
