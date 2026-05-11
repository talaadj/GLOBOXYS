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
  Link
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
import { CompanyProfile } from './types';
import { useTranslation } from './i18n';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';

export default function App() {
  const { t, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState('feed');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
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
    { id: 'expansion', icon: Zap, label: t('synergy') },
    { id: 'profile', icon: Briefcase, label: t('profile') },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 border-8 border-white box-border">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="flex flex-col bg-white border-r border-slate-200 z-20"
      >
        <div className="h-16 px-6 flex items-center gap-3">
          <div className="w-6 h-1 w-1 bg-blue-600 rounded-full" />
          {isSidebarOpen && (
            <span className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
              GLOBAXYS
            </span>
          )}
        </div>

        <div className="p-4 flex-1">
          {isSidebarOpen && <p className="theme-label mb-4 px-2">{t('navigationMatrix')}</p>}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
                {isSidebarOpen && <span className="text-[11px] font-bold tracking-widest uppercase">{item.label}</span>}
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
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 overflow-hidden">
                {profile.logo ? (
                  <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none uppercase">{profile.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${profile.isVerified ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                   <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold">
                     {profile.isVerified ? t('verifiedNode') : t('unverifiedNode')}
                   </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative mr-4 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input 
                placeholder={t('searchNodesPlaceholder')} 
                className="w-64 h-9 bg-slate-50 border-slate-100 text-[10px] font-bold tracking-widest uppercase placeholder:text-slate-300 rounded-lg focus:ring-slate-200"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
              <Bell className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger render={(props) => (
                <Button {...props} variant="outline" size="sm" className="h-9 px-3 gap-2 border-slate-200">
                  <Languages className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">{t('switchLanguage')}</span>
                </Button>
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

            <Button className="bg-slate-950 text-white text-[10px] font-bold h-9 px-6 rounded-lg uppercase tracking-widest hover:bg-slate-800 transition-colors">
              {t('newInitiative')}
            </Button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-auto bg-slate-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-8 max-w-7xl mx-auto w-full min-h-full"
            >
              {activeTab === 'feed' && <SynergyFeed onConnect={startConversation} />}
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {t('nodeStatus')}</span>
            <span className="hidden sm:inline">{t('latency')}</span>
            <span className="text-slate-950">{t('protocolSecured')}</span>
          </div>
          <div className="hidden md:block">{t('copyright')}</div>
        </footer>
      </main>
    </div>
  );
}

