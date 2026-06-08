import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, Heart, Share2, Plus, X, Search, Sparkles, User,
  Hash, Send, Globe, Loader2, ArrowUpRight, Flame
} from 'lucide-react';

export default function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected thread view
  const [selectedPost, setSelectedPost] = useState(null); // Post with comments
  const [newCommentText, setNewCommentText] = useState('');

  // Create post modal
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/forum');
      if (data.success) setPosts(data.data);
    } catch (err) {
      console.warn("Failed fetching community posts.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    try {
      const { data } = await axios.post('/api/forum', {
        title: postTitle.trim(),
        content: postContent.trim(),
        tags: postTags.split(',').map(t => t.trim()).filter(Boolean)
      });
      if (data.success) {
        setCreatePostOpen(false);
        setPostTitle('');
        setPostContent('');
        setPostTags('');
        fetchPosts();
      }
    } catch {
      alert("Failed creating discussion post.");
    }
  };

  const handleLikePost = async (postId, e) => {
    e.stopPropagation(); // Avoid selecting thread row
    try {
      const { data } = await axios.put(`/api/forum/${postId}/like`);
      if (data.success) {
        // Like endpoint returns { success, likesCount, likes } — no .data wrapper
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
        if (selectedPost?._id === postId) {
          setSelectedPost(prev => ({ ...prev, likes: data.likes }));
        }
      }
    } catch {
      alert("Failed updating thread likes status.");
    }
  };

  const handleViewPostDetails = async (post) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/forum/${post._id}`);
      if (data.success) {
        // Backend returns { data: { post, comments } } — flatten into a single object
        setSelectedPost({ ...data.data.post, comments: data.data.comments || [] });
      }
    } catch {
      alert("Failed loading discussion comments details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const { data } = await axios.post(`/api/forum/${selectedPost._id}/comment`, {
        content: newCommentText.trim()
      });
      if (data.success) {
        setNewCommentText('');
        // Reload details — backend returns { data: { post, comments } }
        const { data: details } = await axios.get(`/api/forum/${selectedPost._id}`);
        if (details.success) {
          setSelectedPost({ ...details.data.post, comments: details.data.comments || [] });
          // Update parent post comment count
          setPosts(prev => prev.map(p => p._id === selectedPost._id ? { ...p, commentsCount: details.data.comments?.length || 0 } : p));
        }
      }
    } catch {
      alert("Failed posting reply.");
    }
  };

  if (loading && !selectedPost && !createPostOpen) {
    return (
      <div className="space-y-6">
        <div className="h-10 skeleton w-1/4" />
        <div className="space-y-4">
          <div className="h-28 skeleton rounded-xl" />
          <div className="h-28 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Student <span className="gradient-text">Community Forum</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Discuss mock test questions, share ATS resume optimization hacks, and track recruitment guidelines.
          </p>
        </div>

        <button className="btn btn-primary py-2" onClick={() => setCreatePostOpen(true)}>
          <Plus size={16} /> Create Thread
        </button>
      </div>

      {/* Main Forum Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Threads List */}
        <div className="lg:col-span-2 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 card glass text-muted">
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Awaiting community discussion threads. Be the first to post!</p>
            </div>
          ) : (
            posts.map(post => {
              const hasLiked = post.likes?.includes(user?.id);
              
              return (
                <motion.div
                  key={post._id}
                  className="card glass p-6 cursor-pointer border border-white/5 hover:border-indigo-500/25 transition-all"
                  onClick={() => handleViewPostDetails(post)}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      {/* Title */}
                      <h3 className="text-base md:text-lg font-bold text-white leading-snug group-hover:text-indigo-400">
                        {post.title}
                      </h3>
                      
                      {/* Meta */}
                      <div className="flex flex-wrap gap-2 items-center text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1"><User size={12} /> {post.authorName}</span>
                        <span>·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Content preview */}
                      <p className="text-xs text-muted mt-3 leading-relaxed truncate-2-lines" style={{ color: 'var(--text-secondary)' }}>
                        {post.content}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {post.tags?.map(tag => (
                          <span key={tag} className="badge bg-white/5 text-secondary border-0 text-xxs font-mono" style={{ fontSize: '9px' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats Action row */}
                    <div className="flex flex-col items-center gap-3 bg-white/5 border border-white/5 px-2.5 py-3 rounded-2xl">
                      <button
                        className="hover:text-rose-400 flex flex-col items-center gap-1 transition-colors"
                        style={{ color: hasLiked ? '#f43f5e' : 'var(--text-muted)' }}
                        onClick={(e) => handleLikePost(post._id, e)}
                      >
                        <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                        <span className="text-xxs font-bold" style={{ fontSize: '9px' }}>{post.likes?.length || 0}</span>
                      </button>
                      
                      <div className="flex flex-col items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <MessageSquare size={16} />
                        <span className="text-xxs font-bold" style={{ fontSize: '9px' }}>{post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right: Community Guidelines & accreditations */}
        <div className="space-y-6">
          <div className="card glass">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" /> Forum Guidelines
            </h2>
            <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <p>Welcome to the STUGUIDE X Knowledge Ecosystem. Engage in collaborative major project developments and placement support channels.</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Share authentic company recruiter interview experiences.</li>
                <li>Avoid toxic speech or personal roll number citations.</li>
                <li>Tag threads clearly (#DSA, #Resume, #React).</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Slide-over Comments Details Panel */}
      <AnimatePresence>
        {selectedPost && (
          <>
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPost(null)} />
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-tertiary z-50 p-8 shadow-elevated border-l flex flex-col justify-between"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Thread Discussion</h2>
                <button className="btn-ghost p-1 rounded-lg" onClick={() => setSelectedPost(null)}><X size={20} /></button>
              </div>

              {/* Thread Core Post details */}
              <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                <div className="glass rounded-2xl p-5 border border-white/5 space-y-3">
                  <h3 className="text-base font-bold text-white leading-snug">{selectedPost.title}</h3>
                  <div className="flex gap-2 text-xxs text-muted" style={{ fontSize: '9px' }}>
                    <span className="font-semibold text-indigo-400">{selectedPost.authorName}</span>
                    <span>·</span>
                    <span>{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed pt-2 border-t border-white/5">{selectedPost.content}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs text-muted">
                    <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors" onClick={(e) => handleLikePost(selectedPost._id, e)}>
                      <Heart size={14} fill={selectedPost.likes?.includes(user?.id) ? '#f43f5e' : 'none'} className={selectedPost.likes?.includes(user?.id) ? 'text-rose-500' : ''} />
                      <span>{selectedPost.likes?.length || 0} Likes</span>
                    </button>
                    <span>{selectedPost.comments?.length || 0} Replies</span>
                  </div>
                </div>

                {/* Replies list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Replies</h4>
                  
                  {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                    <div className="text-xs text-muted py-4 italic text-center">No replies posted. Leave a supportive comment below!</div>
                  ) : (
                    selectedPost.comments.map((comm, cidx) => (
                      <div key={comm._id || cidx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex justify-between text-xxs" style={{ fontSize: '9px' }}>
                          <span className="font-semibold text-indigo-400">{comm.authorName || 'Student'}</span>
                          <span className="text-muted">{comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : 'Today'}</span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Create Reply Form input footer */}
              <form onSubmit={handleAddComment} className="pt-4 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Post an encouraging reply..."
                  className="input flex-1 py-2 text-xs"
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary py-2 px-3 text-xs"><Send size={12} /> Reply</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Thread Post Modal */}
      <AnimatePresence>
        {createPostOpen && (
          <div className="modal-backdrop">
            <motion.div className="modal-content" initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Plus size={18} className="text-indigo-400" /> Create Thread Post</h2>
                <button className="btn-ghost p-1 rounded-lg" onClick={() => setCreatePostOpen(false)}><X size={16} /></button>
              </div>
              
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="label">Discussion Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Tips on passing stripe systems design round?"
                    value={postTitle}
                    onChange={e => setPostTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Tag categories (comma separated)</label>
                  <input
                    type="text"
                    className="input font-mono text-xs"
                    placeholder="Stripe, SystemDesign, Placement"
                    value={postTags}
                    onChange={e => setPostTags(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Topic Content / Bio Details</label>
                  <textarea
                    className="input h-32"
                    placeholder="Detail the discussion topic background..."
                    value={postContent}
                    onChange={e => setPostContent(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full justify-center py-2.5">Post Thread</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
