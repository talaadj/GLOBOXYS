/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Scale, 
  Globe2, 
  TrendingUp, 
  Search,
  Plus,
  Bell,
  Settings,
  Menu,
  ChevronRight,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Map,
  Link,
  Cpu,
  BrainCircuit,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import AdvisoryHub from './components/AdvisoryHub';
import SynergyFeed from './components/SynergyFeed';
import Marketplace from './components/Marketplace';
import TalentHub from './components/TalentHub';
import ExpansionTool from './components/ExpansionTool';
import ProfileEditor from './components/ProfileEditor';
import MessagingCenter from './components/MessagingCenter';
import GlobalSearch from './components/GlobalSearch';
import TelegramIntegration from './components/TelegramIntegration';
import NewInitiativeDialog from './components/NewInitiativeDialog';
import NexusHub from './components/NexusHub';
import GrowthHub from './components/GrowthHub';
import { CompanyProfile, Post } from './types';
import { MOCK_POSTS as INITIAL_POSTS } from './data';
import { useTranslation } from './i18n';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';

import { Toaster, toast } from 'sonner';

export default function App() {
  const { t, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState('feed');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isInitiativeOpen, setInitiativeOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Shared posts state
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const addPost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
    setActiveTab('feed');
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const [profile, setProfile] = useState<CompanyProfile>({
    name: t('omnicorpName'),
    tagline: t('omnicorpTagline'),
    description: t('omnicorpDesc'),
    logo: '',
    hq: 'Zurich, Switzerland',
    sector: t('omnicorpSector'),
    size: '10,000+ EMPLOYEES',
    email: 'ops@omnicorp.global',
    website: 'https://omnicorp.global',
    jurisdictions: ['Switzerland', 'Indonesia', 'United Arab Emirates', 'Brazil'],
    capabilities: t('omnicorpCapabilities').split(', '),
    isVerified: true
  });

  const startConversation = (id: string) => {
    setSelectedConversationId(id);
    setActiveTab('messages');
  };

  const navItems = [
    { id: 'feed', icon: LayoutGrid, label: t('dashboard') },
    { id: 'marketplace', icon: Building2, label: t('marketplace') },
    { id: 'advisory', icon: Scale, label: t('advisory') },
    { id: 'talent', icon: Users, label: t('talent') },
    { id: 'messages', icon: MessageSquare, label: t('messages') },
    { id: 'growth', icon: TrendingUp, label: t('growthEngine') },
    { id: 'nexus', icon: Cpu, label: t('nexusHub') },
    { id: 'expansion', icon: BrainCircuit, label: t('synergy') },
    { id: 'telegram', icon: Activity, label: t('telegram') },
    { id: 'profile', icon: Briefcase, label: t('profile') },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 md:border-8 border-white box-border">
      <Toaster position="top-center" expand={false} richColors />
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -280),
          width: 280
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed lg:static inset-y-0 left-0 flex flex-col bg-white border-r border-slate-200 z-40 lg:w-[280px] lg:translate-x-0"
      >
        <div className="h-16 px-6 flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full animate-pulse" />
          <span className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic leading-none lg:block">
            GLOBAXYS
          </span>
        </div>

        <div className="p-4 flex-1">
          <p className="theme-label mb-4 px-2 tracking-[0.3em]">Neural Axis Matrix</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
                <span className="text-[11px] font-bold tracking-widest uppercase">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-2">{t('intelligenceNode')}</p>
            <p className="text-xs leading-relaxed font-light italic mb-4">{t('intelligenceDesc')}</p>
            <button className="w-full py-2 bg-white text-slate-950 text-[10px] font-bold rounded-lg uppercase tracking-wider">{t('update')}</button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white z-20">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('profile')}>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 overflow-hidden group-hover:border-slate-900 transition-colors">
                {profile.logo ? (
                  <img src={profile.logo || undefined} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none uppercase">{profile.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${profile.isVerified ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                   <p className="text-[9px] text-slate-400 uppercase tracking-tight font-bold">
                     {profile.isVerified ? t('verifiedNode') : t('unverifiedNode')}
                   </p>
                </div>
              </div>
            </div>
            
            <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <BrainCircuit className="w-3.5 h-3.5" />
              </div>
              <div>
                 <p className="text-[8px] font-black uppercase text-slate-900 leading-none">AI Co-pilot</p>
                 <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-tighter mt-0.5">Neural Sync: 99.8%</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative mr-4 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <button 
                onClick={() => setSearchOpen(true)}
                className="w-64 h-9 bg-slate-50 border border-slate-100 text-[10px] font-bold tracking-widest uppercase text-slate-400 px-10 rounded-lg focus:outline-none hover:border-slate-300 transition-all text-left flex items-center"
              >
                {t('searchNodesPlaceholder')}
                <kbd className="ml-auto bg-white border border-slate-200 px-1.5 rounded text-[8px] hidden lg:block">⌘K</kbd>
              </button>
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-slate-400"
                onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-slate-900 transition-colors"
                onClick={() => toast.info('Accessing Notification Feed... 0 updates pending.')}
            >
              <Bell className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger nativeButton={true} render={(props) => (
                <button 
                  {...props} 
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-slate-50 hover:text-slate-900 h-9 px-3 gap-2"
                >
                  <Languages className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">{t('switchLanguage')}</span>
                </button>
              )} />
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setLanguage('en')} className="text-xs font-bold uppercase tracking-widest">English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ru')} className="text-xs font-bold uppercase tracking-widest">Русский</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')} className="text-xs font-bold uppercase tracking-widest">Español</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('zh')} className="text-xs font-bold uppercase tracking-widest">中文</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className="text-xs font-bold uppercase tracking-widest">हिन्दी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('fr')} className="text-xs font-bold uppercase tracking-widest">Français</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              className="bg-slate-950 text-white text-[10px] font-bold h-9 px-6 rounded-lg uppercase tracking-widest hover:bg-slate-800 transition-colors hidden sm:flex"
              onClick={() => setInitiativeOpen(true)}
            >
              {t('newInitiative')}
            </Button>
          </div>
        </header>

        {/* Viewport - Main scrollable area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/30 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-8 max-w-7xl mx-auto w-full min-h-full"
            >
              {activeTab === 'feed' && <SynergyFeed posts={posts} setPosts={setPosts} onConnect={startConversation} />}
              {activeTab === 'advisory' && <AdvisoryHub />}
              {activeTab === 'marketplace' && <Marketplace onConnect={startConversation} />}
              {activeTab === 'talent' && <TalentHub />}
              {activeTab === 'messages' && (
                <MessagingCenter 
                  initialSelectedId={selectedConversationId} 
                  onSelectConversation={setSelectedConversationId} 
                />
              )}
              {activeTab === 'expansion' && <ExpansionTool />}
              {activeTab === 'profile' && (
                <ProfileEditor 
                  profile={profile} 
                  onSave={setProfile} 
                />
              )}
              {activeTab === 'nexus' && <NexusHub />}
              {activeTab === 'growth' && <GrowthHub />}
              {activeTab === 'telegram' && <TelegramIntegration />}
            </motion.div>
          </AnimatePresence>
        </div>

        <GlobalSearch 
          open={isSearchOpen} 
          onOpenChange={setSearchOpen} 
          onNavigate={(tab) => setActiveTab(tab)} 
        />

        <NewInitiativeDialog 
          open={isInitiativeOpen}
          onOpenChange={setInitiativeOpen}
          onBroadcast={addPost}
        />

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-slate-200 px-4 md:px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <div className="flex gap-4 md:gap-8">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {t('nodeStatus')}</span>
            <span className="hidden lg:inline">{t('latency')}</span>
            <span className="text-slate-950 truncate max-w-[100px] sm:max-w-none">{t('protocolSecured')}</span>
          </div>
          <div className="hidden md:block">{t('copyright')}</div>
        </footer>
      </main>
    </div>
  );
}

