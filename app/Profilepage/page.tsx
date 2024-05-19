'use client'
import React, { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface ProfileData {
  username: string;
  email: string;
  id: number; // Add user ID field
  // Add other profile data fields here
}

interface PostData {
  id: number;
  title: string;
  body: string;
  image: string;
  // Add other post data fields here
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg relative w-full max-w-md">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Access token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get<ProfileData>('http://localhost:8000/api/profile/', { headers });
      setProfileData(response.data);
      if (response.data) {
        loadUserPosts(response.data.id);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError('Error loading profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async (userId: number) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Access token not found. Please log in again.');
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const response = await axios.get<PostData[]>(`http://localhost:8000/api/posts/?userId=${userId}`, { headers });
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Error loading posts. Please try again.');
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      if (image) {
        formData.append('image', image);
      }

      let response;
      if (editingPost) {
        response = await axios.put(`http://localhost:8000/api/posts/${editingPost.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        setEditingPost(null);
      } else {
        response = await axios.post('http://localhost:8000/api/posts/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log('Post saved successfully:', response.data);
      setTitle('');
      setBody('');
      setImage(null);
      setPostError(null);
      setIsModalOpen(false);
      profileData && loadUserPosts(profileData.id);
    } catch (error) {
      console.error('Error saving post:', error);
      setPostError('Failed to save post. Please try again.');
    }
  };

  const handleEditPost = (post: PostData) => {
    setTitle(post.title);
    setBody(post.body);
    setImage(null); // Do not pre-fill image as it's handled separately in the form
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found. Please log in again.');
      }

      await axios.delete(`http://localhost:8000/api/posts/${postId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Post deleted successfully');
      if (profileData) {
        loadUserPosts(profileData.id);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setPostError('Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Profile Page</h2>
      {loading ? (
        <p>Loading profile data...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : profileData ? (
        <div className="mb-4">
          <p><strong>Username:</strong> {profileData.username}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          {/* Add other profile data fields here */}
        </div>
      ) : (
        <p>No profile data available.</p>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
        {postError && <p className="text-red-500">{postError}</p>}
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div>
            <label className="block">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block">Body:</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block">Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingPost ? 'Update' : 'Submit'}
          </button>
          {editingPost && (
            <button
              type="button"
              onClick={() => {
                setEditingPost(null);
                setIsModalOpen(false);
              }}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Your Posts</h2>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="border p-4 rounded">
                <h3 className="text-lg font-bold">{post.title}</h3>
                <p>{post.body}</p>
                {post.image && <img src={post.image} alt={post.title} className="max-w-xs" />}
                <div className="mt-2">
                  <button
                    onClick={() => handleEditPost(post)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <h2 className="text-xl font-bold mb-2">{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
          {postError && <p className="text-red-500">{postError}</p>}
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <label className="block">Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Body:</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block">Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              {editingPost ? 'Update' : 'Submit'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;

