'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Post {
  id: number;
  title: string;
  body: string;
  image: string;
}

const PostComponent: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="pos bg-orange-700 p-4 border-2">
      <h2 className='font-bold text-3xl bg-pink-400 p-2 text-center rounded-3xl '>{post.title}</h2>
      <p className='text-xl bg-yellow-200 p-4 rounded-2xl mt-4 mb-4'>{post.body}</p>
      {post.image && <img className='mx-auto rounded-2xl shadow-full shadow-black  hover:top-7 ' src={post.image} alt={post.title} />} {/* Display image if exists */}
    </div>
  );
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>('http://localhost:8000/api/posts/');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="app">
      <h1>Posts</h1>
      <div className="posts">
        {posts.map(post => (
          <PostComponent key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default App;
