import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  ArrowUpRight, 
  Languages, 
  Loader2, 
  Settings, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Send, 
  Megaphone, 
  Star, 
  SmilePlus, 
  Plus,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Link as LinkIcon,
  Mail,
  Twitter,
  Linkedin,
  RefreshCw,
  Globe,
  Pencil,
  Check,
  X,
  Bot,
  Zap
} from 'lucide-react';
import { Post } from '../types';
import { geminiService } from '../services/geminiService';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { MOCK_POSTS as INITIAL_POSTS } from '../data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { useTranslation, getLanguageName } from '../i18n';

// Global Cache Manager for TikTok-style performance
const VIDEO_CACHE_NAME = 'globaxys-video-cache-v1';
const MAX_CACHE_SIZE = 25; // Slightly increased for better buffer
const CACHE_USAGE_KEY = 'globaxys-video-cache-usage';

interface CacheRequest {
  url: string;
  priority: 'high' | 'low';
  timestamp: number;
}

const VideoCacheManager = {
  activeRequests: new Map<string, AbortController>(),
  pendingQueue: [] as CacheRequest[],
  isProcessing: false,

  getUsageMap(): Record<string, number> {
    try {
      const stored = localStorage.getItem(CACHE_USAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  updateUsage(url: string) {
    const usage = this.getUsageMap();
    usage[url] = Date.now();
    localStorage.setItem(CACHE_USAGE_KEY, JSON.stringify(usage));
  },

  async evictOldestIfNeeded() {
    try {
      const cache = await caches.open(VIDEO_CACHE_NAME);
      const keys = await cache.keys();
      
      if (keys.length < MAX_CACHE_SIZE) return;

      const usage = this.getUsageMap();
      const sortedByUsage = keys
        .map(req => req.url)
        .sort((a, b) => (usage[a] || 0) - (usage[b] || 0));

      const candidates = sortedByUsage.slice(0, Math.ceil(MAX_CACHE_SIZE * 0.3));
      for (const url of candidates) {
        await cache.delete(url);
        delete usage[url];
      }
      localStorage.setItem(CACHE_USAGE_KEY, JSON.stringify(usage));
      console.log(`Video cache optimized: decommissioned ${candidates.length} nodes`);
    } catch (e) {
      console.error('Eviction failed:', e);
    }
  },

  async getCachedVideo(url: string): Promise<string | null> {
    try {
      const cache = await caches.open(VIDEO_CACHE_NAME);
      const response = await cache.match(url);
      if (response) {
        this.updateUsage(url);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.error('Cache retrieval failed:', e);
    }
    return null;
  },

  /**
   * Prioritized caching: High priority for currently visible, low for upcoming
   */
  async cacheVideo(url: string, priority: 'high' | 'low' = 'low'): Promise<string | null> {
    // 1. Check if already in cache
    const existing = await this.getCachedVideo(url);
    if (existing) return existing;

    // 2. Handle ongoing request for same URL
    if (this.activeRequests.has(url)) {
      if (priority === 'high') {
        // Boost priority if it was low (by re-fetching with high priority hint)
        // Browsers handle priority hints well, so we can just let it finish or use the queue
      }
      return null;
    }

    // 3. Add to prioritized queue
    this.addToQueue(url, priority);
    return null;
  },

  addToQueue(url: string, priority: 'high' | 'low') {
    // Remove if already in queue to update priority/position
    this.pendingQueue = this.pendingQueue.filter(r => r.url !== url);
    
    // High priority goes to front, low to back
    if (priority === 'high') {
      this.pendingQueue.unshift({ url, priority, timestamp: Date.now() });
    } else {
      this.pendingQueue.push({ url, priority, timestamp: Date.now() });
    }

    if (!this.isProcessing) {
      this.processQueue();
    }
  },

  async processQueue() {
    if (this.pendingQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const item = this.pendingQueue.shift()!;
    
    // Check if we already have it being worked on
    if (this.activeRequests.has(item.url)) {
      this.processQueue();
      return;
    }

    try {
      const controller = new AbortController();
      this.activeRequests.set(item.url, controller);

      const cache = await caches.open(VIDEO_CACHE_NAME);
      const alreadyInCache = await cache.match(item.url);
      
      if (!alreadyInCache) {
        await this.evictOldestIfNeeded();
        
        // Use priority hint (experimental but supported in Chrome/Edge/Safari)
        // @ts-ignore - priority is a valid fetch option in modern browsers
        const response = await fetch(item.url, { 
          signal: controller.signal,
          priority: item.priority === 'high' ? 'high' : 'low'
        });

        if (response.ok) {
          const responseClone = response.clone();
          await cache.put(item.url, responseClone);
          this.updateUsage(item.url);
          console.log(`Node ${item.url.split('/').pop()} cached with ${item.priority} priority`);
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Caching execution failed:', e);
      }
    } finally {
      this.activeRequests.delete(item.url);
      // Process next in queue after a small delay to avoid congestion
      setTimeout(() => this.processQueue(), 50);
    }
  },

  cancelCache(url: string) {
    const controller = this.activeRequests.get(url);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(url);
    }
    this.pendingQueue = this.pendingQueue.filter(r => r.url !== url);
  }
};

const VideoPlayer = ({ src, autoPlayEnabled = true }: { src: string; autoPlayEnabled?: boolean }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNear, setIsNear] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Pre-caching logic based on proximity
  useEffect(() => {
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          VideoCacheManager.cacheVideo(src, 'low');
        }
      },
      { rootMargin: '1200px' } // Pre-cache when within 1200px of viewport
    );

    if (containerRef.current) {
      nearObserver.observe(containerRef.current);
    }

    return () => nearObserver.disconnect();
  }, [src]);

  // 2. Playback and High Priority Cache logic
  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadVideo = async (priority: 'high' | 'low' = 'low') => {
      // 1. Try Cache
      const cached = await VideoCacheManager.getCachedVideo(src);
      if (cached && isMounted) {
        objectUrl = cached;
        setVideoSrc(cached);
        setLoading(false);
        return;
      }

      // 2. Fallback to direct URL but start high-priority caching if needed
      if (isMounted) {
        setVideoSrc(src);
        setLoading(false);
      }

      // 3. Cache for future use with given priority
      await VideoCacheManager.cacheVideo(src, priority);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // If visible, ensure high priority caching
          loadVideo('high');
          
          videoRef.current?.play().catch(() => {
            console.warn("Autoplay blocked by browser policy");
          });
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    if (isNear) {
      loadVideo('low');
    }

    return () => {
      isMounted = false;
      observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, isNear]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      videoRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative group/player rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-30">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}
      <video 
        ref={videoRef}
        src={videoSrc || undefined}
        className={`max-w-full max-h-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        muted={isMuted}
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/player:opacity-100 transition-opacity flex items-center justify-center">
        {!isPlaying && (
          <motion.button 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={togglePlay}
            className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-2xl"
          >
            <Play className="w-8 h-8 fill-current" />
          </motion.button>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors pointer-events-auto">
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors pointer-events-auto">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/60 tracking-tighter uppercase">{t('operationalFeed')}</span>
        </div>
      </div>
    </div>
  );
};

interface SynergyFeedProps {
  onConnect?: (id: string) => void;
  posts?: Post[];
  setPosts?: React.Dispatch<React.SetStateAction<Post[]>>;
}

export default function SynergyFeed({ onConnect, posts: externalPosts, setPosts: externalSetPosts }: SynergyFeedProps) {
  const { t, language, setLanguage } = useTranslation();
  const [internalPosts, setInternalPosts] = useState<Post[]>(INITIAL_POSTS);
  
  const posts = externalPosts || internalPosts;
  const setPosts = externalSetPosts || setInternalPosts;

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [translatingAll, setTranslatingAll] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  
  const [isPosting, setIsPosting] = useState(false);
  
  // Create post state
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState<{type: 'image' | 'video', url: string} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // TikTok Algorithm: Sort by "Synergy Score"
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const getScore = (p: Post) => {
        const reactionsVal = Object.values(p.reactions || {}).reduce((s, c) => s + c, 0);
        
        // Base engagement score
        let score = (p.likes * 2) + (reactionsVal * 3) + ((p.rating || 0) * 5);
        
        // Recency boost: If post ID is numeric (from Date.now()), boost it if it's recent
        const numericId = parseInt(p.id.substring(1));
        if (!isNaN(numericId)) {
          const hoursOld = (Date.now() - numericId) / (1000 * 60 * 60);
          if (hoursOld < 1) score += 1000; // Massive boost for posts less than 1 hour old
          else if (hoursOld < 24) score += 500 / hoursOld; // Decaying boost for 1st day
        }

        // Own posts boost to ensure visibility
        if (p.companyId === 'my-node') score += 2000;

        return score;
      };
      return getScore(b) - getScore(a);
    });
  }, [posts]);

  useEffect(() => {
    if (isPosting && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isPosting]);

  // Infinite Scroll Simulation (TikTok Cache/Algo style)
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 100 && 
        !isLoadingMore
      ) {
        setIsLoadingMore(true);
        setTimeout(() => {
          // Add more mock data or cycle existing to simulate infinity
          setPosts(prev => [...prev, ...INITIAL_POSTS.map(p => ({ ...p, id: `${p.id}-node-${Date.now()}` }))]);
          setIsLoadingMore(false);
          toast.info(t('syncingNodes'), { position: 'bottom-right' });
        }, 1200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaFile({ type, url });
    }
  };

  const toggleLike = (postId: string) => {
    const isLiked = !likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
    
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + (isLiked ? 1 : -1) } : p));

    if (isLiked) {
      toast.success(t('pulseRegistered'), {
        icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />,
        className: 'font-bold uppercase tracking-widest text-[10px]'
      });
    }
  };

  const handleAddReaction = (postId: string, emoji: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const reactions = { ...(p.reactions || {}) };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...p, reactions };
      }
      return p;
    }));
    toast.success(`${emoji} ${t('reactionAdded')}`);
  };

  const handleRate = (postId: string, rating: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, rating } : p));
    toast.success(`${t('evaluatedStars')} ${rating} ${t('stars')}`);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !mediaFile) return;

    const newPost: Post = {
      id: `p${Date.now()}`,
      companyId: 'my-node',
      companyName: 'OmniCorp',
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: ['BROADCAST'],
      media: mediaFile || undefined,
      rating: 0,
      reactions: {}
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setMediaFile(null);
    setIsPosting(false);
    toast.success(t('directiveBroadcasted'), {
      icon: <Megaphone className="w-4 h-4 text-blue-600" />
    });
  };

  const handleShare = (type: 'link' | 'email' | 'linkedin' | 'twitter', post: Post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `${t('shareBody')}${post.companyName}: ${post.content.substring(0, 50)}...`;
    
    switch (type) {
      case 'link':
        navigator.clipboard.writeText(shareUrl);
        toast.success(t('linkCopied'), {
          icon: <LinkIcon className="w-4 h-4 text-blue-600" />,
          className: 'font-bold uppercase tracking-widest text-[10px]'
        });
        break;
      case 'email':
        const mailto = `mailto:?subject=${encodeURIComponent(t('shareSubject'))}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        window.location.href = mailto;
        break;
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
        break;
      case 'linkedin':
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank');
        break;
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast.error(t('delete'), {
      icon: <Settings className="w-4 h-4 rotate-45" />,
      className: 'font-bold uppercase tracking-widest text-[10px]'
    });
  };

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  // Simulation: Periodic fetching of new strategic connections
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        // Generate a single new post to simulate a real-time update
        const newPosts = await geminiService.generateStrategicPosts(1, getLanguageName(language));
        if (newPosts.length > 0) {
          // Give it a fresh ID based on current time
          const freshPost = { 
            ...newPosts[0], 
            id: `p${Date.now()}`,
            timestamp: 'Just now'
          };
          setPendingPosts(prev => [freshPost, ...prev]);
        }
      } catch (error) {
        console.error("Pulse sync failed:", error);
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(pollInterval);
  }, [language]);

  const handleSyncPending = () => {
    setPosts(prev => [...pendingPosts, ...prev]);
    setPendingPosts([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success(t('incomingStream'), {
      icon: <Zap className="w-4 h-4" />,
      className: 'font-bold uppercase tracking-widest text-[10px]'
    });
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setIsAnalysisOpen(true);
    try {
      const result = await geminiService.analyzeFeedForConnections(posts, getLanguageName(language));
      setAiAnalysis(result);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast.error(t('analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const handleUpdatePost = () => {
    if (!editingPostId) return;
    setPosts(prev => prev.map(p => p.id === editingPostId ? { ...p, content: editContent } : p));
    // Clear translation for updated post
    setTranslations(prev => {
      const next = { ...prev };
      delete next[editingPostId];
      return next;
    });
    setEditingPostId(null);
    toast.success(t('update'), {
      icon: <Settings className="w-4 h-4" />,
      className: 'font-bold uppercase tracking-widest text-[10px]'
    });
  };

  const handleTranslate = async (postId: string, text: string) => {
    if (translations[postId]) {
      // Toggle back to original if already translated
      const updatedTranslations = { ...translations };
      delete updatedTranslations[postId];
      setTranslations(updatedTranslations);
      return;
    }

    setTranslating(prev => ({ ...prev, [postId]: true }));
    try {
      const translated = await geminiService.translateText(text, getLanguageName(language));
      setTranslations(prev => ({ ...prev, [postId]: translated }));
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setTranslating(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleTranslateAll = async () => {
    setTranslatingAll(true);
    try {
      const translationPromises = posts.map(async (post) => {
        // Only translate if not already translated
        if (!translations[post.id]) {
          const translated = await geminiService.translateText(post.content, getLanguageName(language));
          return { id: post.id, text: translated };
        }
        return null;
      });

      const results = await Promise.all(translationPromises);
      const newTranslations = { ...translations };
      results.forEach(res => {
        if (res) {
          newTranslations[res.id] = res.text;
        }
      });
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Bulk translation failed:', error);
    } finally {
      setTranslatingAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-4 gap-4">
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            {t('operationalPulse')}
            {pendingPosts.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm ring-4 ring-red-500/10"
              />
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">
            {t('synergyDesc')}
            {pendingPosts.length > 0 && (
              <span className="ml-2 text-blue-600 font-bold animate-pulse text-[10px]">
                • {pendingPosts.length} UPDATES
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] h-9 px-6 rounded-lg shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
            onClick={() => setIsPosting(!isPosting)}
          >
            {isPosting ? <Settings className="w-3.5 h-3.5 rotate-45" /> : <Plus className="w-3.5 h-3.5" />}
            {isPosting ? t('cancel') : t('newBroadcast')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger nativeButton={true} render={(props) => (
              <button 
                {...props}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-900 group h-9 w-9 p-0 transition-all duration-300 hover:rotate-90 hover:border-slate-400"
              >
                <Settings className="w-4 h-4" />
              </button>
            )} />
            <DropdownMenuContent align="end" className="w-48 p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-2 py-1.5">{t('translate')} {t('language')}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                {(['en', 'ru', 'es', 'zh', 'hi', 'fr'] as const).map((lang) => (
                  <DropdownMenuItem 
                    key={lang}
                    onClick={() => setLanguage(lang)} 
                    className={`text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer ${language === lang ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
                  >
                    {getLanguageName(lang)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-slate-200 text-slate-600 hover:text-slate-950 hover:border-slate-400 h-9 px-4 text-[10px] font-bold uppercase tracking-widest gap-2 flex-1 sm:flex-none"
            onClick={handleTranslateAll}
            disabled={translatingAll}
          >
            {translatingAll ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Languages className="w-3.5 h-3.5" />
            )}
            {t('translateAll')}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-9 px-4 text-[10px] font-bold uppercase tracking-widest gap-2 flex-1 sm:flex-none border transition-all"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5" />
            )}
            {t('aiCopilot')}
          </Button>

          <div className="hidden sm:flex gap-2">
            {['TECH', 'ENERGY', 'LATAM'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {isPosting && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              {/* Create Post Card */}
              <div className="theme-card p-6 border-slate-200 bg-white">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-[10px] italic">
                    OC
                  </div>
                  <div className="flex-1 space-y-3">
                    <Textarea 
                      ref={textareaRef}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={t('broadcastPlaceholder')}
                      className="min-h-[100px] border-none focus-visible:ring-0 text-sm font-light italic bg-slate-50 p-4 rounded-xl resize-none"
                    />
                    
                    {mediaFile && (
                      <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-200">
                        {mediaFile.type === 'image' ? (
                          <img src={mediaFile.url || undefined} alt="Media preview" className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <VideoPlayer src={mediaFile.url} />
                        )}
                        <button 
                          onClick={() => setMediaFile(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-20"
                        >
                          <Settings className="w-3.5 h-3.5 rotate-45" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => handleFileChange(e, 'image')} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <input 
                      type="file" 
                      ref={videoInputRef} 
                      onChange={(e) => handleFileChange(e, 'video')} 
                      accept="video/*" 
                      className="hidden" 
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 px-3 flex items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {t('photo')}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 px-3 flex items-center gap-2"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <VideoIcon className="w-3.5 h-3.5" />
                      {t('video')}
                    </Button>
                  </div>
                  <Button 
                    disabled={!newPostContent.trim() && !mediaFile}
                    onClick={handleCreatePost}
                    className="h-9 px-6 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:shadow-lg hover:shadow-slate-200 transition-all flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t('broadcast')}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {pendingPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center sticky top-24 z-40 pointer-events-none mb-6"
            >
              <button
                onClick={handleSyncPending}
                className="pointer-events-auto bg-blue-600 text-white px-6 py-2.5 rounded-full shadow-2xl shadow-blue-400/40 flex items-center gap-3 hover:bg-blue-700 transition-all group scale-95 hover:scale-100"
              >
                <div className="relative">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-blue-600 animate-ping" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {pendingPosts.length} NEW NODES DETECTED
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-bold">
                  {t('syncHub')}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {sortedPosts.map((post) => (
          <motion.div 
            layout
            key={post.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group p-8 theme-card flex flex-col items-start gap-6 rounded-[2.5rem] hover:border-slate-300 transition-all border-slate-100 bg-white/50 backdrop-blur-sm shadow-xl shadow-slate-100/50 overflow-hidden relative"
          >
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white text-xs italic">
                    {post.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-950 leading-none">{post.companyName}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
                      {t('verifiedNode')} • {post.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.rating !== undefined && (
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 mr-2">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-slate-700">{post.rating}</span>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
                    onClick={() => handleTranslate(post.id, post.content)}
                    disabled={translating[post.id]}
                  >
                    {translating[post.id] ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                    ) : (
                      <Languages className="w-3 h-3 mr-1.5" />
                    )}
                    {translations[post.id] ? t('showOriginal') : t('translate')}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={true} render={(props) => (
                      <button {...props} className="h-8 w-8 inline-flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors hover:bg-slate-50 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )} />
                    <DropdownMenuContent align="end" className="w-40">
                      {post.companyId === 'my-node' && (
                        <>
                          <DropdownMenuItem onClick={() => startEditing(post)} className="text-[10px] font-bold uppercase tracking-widest gap-2">
                            <Pencil className="w-3 h-3" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-[10px] font-bold uppercase tracking-widest gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                            <X className="w-3 h-3" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </>
                      )}
                      {post.companyId !== 'my-node' && (
                        <DropdownMenuItem onClick={() => toast.info(t('actionNotPermitted'))} className="text-[10px] font-bold uppercase tracking-widest gap-2">
                          <Star className="w-3 h-3" />
                          {t('report')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {post.companyId === 'my-node' && editingPostId !== post.id && (
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => startEditing(post)}
                    className="h-7 text-[9px] font-bold uppercase tracking-[0.15em] border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-full px-3 flex items-center gap-1.5 transition-all"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    {t('editPost')}
                  </Button>
                </div>
              )}
              
              {editingPostId === post.id ? (
                <div className="mb-6 space-y-4 bg-slate-50 p-4 rounded-2xl border border-blue-100 shadow-sm transition-all">
                  <Textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm font-light italic bg-white p-4 rounded-xl resize-none border border-blue-200 focus-visible:ring-blue-100 min-h-[120px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      onClick={handleUpdatePost}
                      className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest h-9 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t('save')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setEditingPostId(null)}
                      className="text-[10px] font-bold uppercase tracking-widest h-9 px-6 rounded-lg text-slate-500 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed font-light mb-4 italic transition-all duration-300">
                  "{translations[post.id] || post.content}"
                </p>
              )}

              {post.media && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video md:aspect-[16/9] relative group/media">
                   {post.media.type === 'image' ? (
                     <img src={post.media.url || undefined} alt="Post media" className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
                   ) : (
                     <VideoPlayer 
                      src={post.media.url} 
                    />
                   )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                {post.reactions && Object.keys(post.reactions).length > 0 && (
                  <div className="flex items-center gap-2">
                    {Object.entries(post.reactions).map(([emoji, count]) => (
                      <motion.button 
                        key={emoji}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 1.4 }}
                        onClick={() => handleAddReaction(post.id, emoji)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-full hover:border-slate-300 transition-colors"
                      >
                        <span className="text-xs">{emoji}</span>
                        <motion.span 
                          key={count} 
                          initial={{ scale: 1.5, color: '#3b82f6' }} 
                          animate={{ scale: 1, color: '#94a3b8' }}
                          className="text-[9px] font-bold text-slate-400"
                        >
                          {count}
                        </motion.span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full md:w-32 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col items-end gap-3 justify-center h-full sm:min-h-[120px]">
               <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold uppercase text-blue-600 tracking-tighter">{t('highSynergy')}</p>
                  <p className="text-[9px] text-slate-400">94% {t('match')}</p>
               </div>
               
               <div className="flex flex-col gap-2 w-full">
                 <Button 
                   className="w-full bg-slate-900 text-white text-[10px] font-bold py-2 rounded uppercase tracking-widest hover:bg-slate-800 h-8 px-0"
                   onClick={() => onConnect?.(post.companyId)}
                 >
                    {t('connect')}
                 </Button>
                 
                 <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={true} render={(props) => (
                      <button 
                        {...props}
                        className="w-full text-slate-950 text-[10px] font-bold py-1 rounded uppercase tracking-widest hover:bg-slate-50 h-8 border border-slate-200 transition-colors flex items-center justify-center gap-1 px-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span className="truncate">{t('share')}</span>
                      </button>
                    )} />
                    <DropdownMenuContent align="end" className="w-44 p-2 font-sans">
                       <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleShare('link', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                          {t('copyLink')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('email', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          {t('shareEmail')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('twitter', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Twitter className="w-3.5 h-3.5 text-slate-600" />
                          {t('shareTwitter')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('linkedin', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Linkedin className="w-3.5 h-3.5 text-blue-800" />
                          {t('shareLinkedIn')}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>
               </div>
               
               <div className="flex gap-4 w-full justify-around md:justify-end opacity-60 hover:opacity-100 transition-opacity mt-2 md:mt-0">
                  <motion.div
                    whileTap={{ scale: 1.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => toggleLike(post.id)}
                    className="cursor-pointer"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        likedPosts[post.id] 
                        ? 'text-rose-500 fill-rose-500' 
                        : 'hover:text-rose-500 hover:fill-rose-500'
                      }`} 
                    />
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 1.2 }}
                    className="cursor-pointer"
                    onClick={() => toast.info(t('comment'), { description: t('initializingComms') })}
                  >
                    <MessageSquare className="w-4 h-4 hover:text-blue-600 transition-colors" />
                  </motion.div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={true} render={(props) => (
                      <button {...props} className="cursor-pointer bg-transparent border-none p-0 outline-none">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <SmilePlus className="w-4 h-4 hover:text-blue-600 transition-colors" />
                        </motion.div>
                      </button>
                    )} />
                    <DropdownMenuContent align="center" className="flex p-1 gap-1">
                      {['🚀', '💡', '✅', '🔥', '👏', '🤔'].map(emoji => (
                        <DropdownMenuItem 
                          key={emoji} 
                          onClick={() => handleAddReaction(post.id, emoji)}
                          className="p-2 cursor-pointer hover:bg-slate-50 rounded"
                        >
                          <motion.span whileHover={{ scale: 1.5 }} whileTap={{ scale: 0.8 }}>
                            {emoji}
                          </motion.span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={true} render={(props) => (
                      <button {...props} className="cursor-pointer bg-transparent border-none p-0 outline-none">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Star className="w-4 h-4 hover:text-amber-500 transition-colors" />
                        </motion.div>
                      </button>
                    )} />
                    <DropdownMenuContent align="center" className="p-2">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 py-1">{t('strategicRelevance')}</DropdownMenuLabel>
                        <div className="flex gap-1 p-1">
                           {[1, 2, 3, 4, 5].map(num => (
                             <button
                                key={num}
                                onClick={() => handleRate(post.id, num)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[10px] font-bold transition-colors"
                             >
                               {num}
                             </button>
                           ))}
                        </div>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger nativeButton={true} render={(props) => (
                      <button {...props} className="cursor-pointer bg-transparent border-none p-0 outline-none">
                        <motion.div
                          whileTap={{ scale: 0.8 }}
                          className="flex items-center justify-center"
                        >
                          <Share2 className="w-4 h-4 hover:text-indigo-600 transition-colors" />
                        </motion.div>
                      </button>
                    )} />
                    <DropdownMenuContent align="end" className="w-44 p-2">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 px-2 py-1">{t('share')}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem onClick={() => handleShare('link', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                          {t('copyLink')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('email', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          {t('shareEmail')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('twitter', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Twitter className="w-3.5 h-3.5 text-slate-600" />
                          {t('shareTwitter')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare('linkedin', post)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50">
                          <Linkedin className="w-3.5 h-3.5 text-blue-800" />
                          {t('shareLinkedIn')}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
          </motion.div>
        ))}
        
        {isLoadingMore && (
           <div className="py-12 flex flex-col items-center justify-center gap-4 border-t border-slate-100">
             <div className="flex gap-1.5 h-1">
               {[1, 2, 3].map(i => (
                 <motion.div 
                   key={i}
                   animate={{ height: [4, 12, 4] }}
                   transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                   className="w-1 bg-blue-600 rounded-full"
                 />
               ))}
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('nodeSyncing')}</p>
           </div>
        )}
      </div>

      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 bg-white border-slate-200 rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">{t('aiCopilotTitle')}</DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
                  {t('strategicAnalysis')}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64 gap-6">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-16 h-16 border-t-2 border-r-2 border-blue-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-900">{t('scanningGrid')}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest animate-pulse">{t('connectingNodes')}</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-slate prose-sm max-w-none"
              >
                <div className="markdown-body p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              </motion.div>
            ) : null}
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-slate-50 bg-white">
            <Button 
                onClick={() => setIsAnalysisOpen(false)}
                className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-3 px-8 h-auto rounded-xl hover:bg-slate-800 transition-all"
              >
                {t('close')}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
