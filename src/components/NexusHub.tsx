import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Globe, Layout, ArrowUpRight, AppWindow, Settings2, Trash2, Cpu, Zap, Activity, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';

interface IntegratedApp {
  id: string;
  name: string;
  url: string;
  category: string;
  aiSyncStatus: 'synced' | 'connecting' | 'error';
}

export default function NexusHub() {
  const { t } = useTranslation();
  const [showAddApp, setShowAddApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  
  const [apps, setApps] = useState<IntegratedApp[]>([
    { id: '1', name: 'Global Weather Insight', url: 'https://weather.com', category: 'Environment', aiSyncStatus: 'synced' },
    { id: '2', name: 'Solto Ecosystem', url: 'https://solto.example.app', category: 'Finance', aiSyncStatus: 'synced' },
    { id: '3', name: 'Google Maps Node', url: 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d158858.4734000266!2d-0.1276474!3d51.5073219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v1715582000000!5m2!1sen!2suk', category: 'Logistics', aiSyncStatus: 'synced' },
  ]);

  const handleAddApp = () => {
    if (!newAppName || !newAppUrl) {
      toast.error('Protocol mismatch: missing parameters');
      return;
    }
    
    // Normalize URL
    let url = newAppUrl;
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    const newApp: IntegratedApp = {
      id: Date.now().toString(),
      name: newAppName,
      url: url,
      category: 'Custom',
      aiSyncStatus: 'connecting'
    };

    setApps([newApp, ...apps]);
    setNewAppName('');
    setNewAppUrl('');
    setShowAddApp(false);
    toast.success('Neural link established successfully');

    // Simulate connection delay
    setTimeout(() => {
      setApps(prev => prev.map(a => a.id === newApp.id ? { ...a, aiSyncStatus: 'synced' } : a));
      toast.info(`AI Co-pilot synchronized with ${newApp.name}`);
    }, 2000);
  };

  const removeApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
    toast.info('Neural connection severed');
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">
              {t('legoMode')}
            </h2>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            {t('nexusHub')}
            <Badge variant="outline" className="text-[10px] bg-slate-900 text-white border-none py-1">NEURAL_v4.0</Badge>
          </h1>
          <p className="text-slate-500 font-light max-w-xl italic">
            {t('nexusHubDesc')}
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline"
            className="border-slate-200 text-xs font-bold uppercase tracking-widest rounded-none h-14 px-6"
          >
            <Activity className="w-4 h-4 mr-2" />
            Global Sync
          </Button>
          <Button 
            onClick={() => setShowAddApp(true)}
            className="bg-slate-900 hover:bg-blue-600 text-white rounded-none h-14 px-8 text-xs font-bold uppercase tracking-[0.2em] transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('addApp')}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAddApp && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-2 border-slate-200 bg-slate-50/50 rounded-[2rem] overflow-hidden">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('appName')}</label>
                    <Input 
                      placeholder="e.g. SOLTO NEURAL"
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      className="bg-white border-slate-200 text-sm font-bold uppercase tracking-widest rounded-xl focus:ring-blue-600 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('appUrl')}</label>
                    <Input 
                      placeholder="https://neural.globaxys.com"
                      value={newAppUrl}
                      onChange={(e) => setNewAppUrl(e.target.value)}
                      className="bg-white border-slate-200 text-sm italic rounded-xl focus:ring-blue-600 h-12"
                    />
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAddApp(false)}
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Abort Sequence
                  </Button>
                  <Button 
                    onClick={handleAddApp}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-8"
                  >
                    Authorize Neural Uplink
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {apps.map((app) => (
          <motion.div
            layout
            key={app.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 h-[550px] flex flex-col transition-all hover:border-blue-200"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase tracking-tighter shadow-lg shadow-slate-400/20 relative">
                  {app.name.charAt(0)}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${app.aiSyncStatus === 'synced' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    {app.name}
                    <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 border-slate-200 text-slate-400">
                      {app.category}
                    </Badge>
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {app.url.slice(0, 30)}...
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100/50 border border-slate-200/50">
                      <div className="w-1 h-1 bg-blue-600 rounded-full animate-ping" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">AI_CO-PILOT_ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                  onClick={() => window.open(app.url, '_blank')}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  onClick={() => removeApp(app.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-slate-900/5 relative group/iframe overflow-hidden">
              <div className="absolute inset-0 z-10 pointer-events-none border-[12px] border-white/50 rounded-[2rem]" />
              <iframe 
                src={app.url}
                title={app.name}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
              
              {/* Overlay for specific apps or demo mode */}
              {(app.url.includes('example') || app.url.includes('google')) && (
                <div className="absolute inset-0 bg-slate-100/10 backdrop-blur-[2px] opacity-0 group-hover/iframe:opacity-100 transition-opacity flex flex-col items-center justify-end p-8 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-2xl flex items-center gap-6 max-w-lg">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Human-AI Co-pilot</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        Neural sync engine active. Interactions reflected in global operational state.
                        Strategic advice available via secondary comms channel.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center overflow-hidden">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">AI</div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Collaborative Sync: Optimal</span>
               </div>
               <div className="flex gap-1.5 h-1">
                 {[1, 2, 3, 4].map(i => (
                   <motion.div 
                     key={i}
                     animate={{ height: [2, 8, 2] }}
                     transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                     className="w-0.5 bg-blue-400 rounded-full"
                   />
                 ))}
               </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Ecosystem Prompt */}
      <div className="theme-card p-12 text-center rounded-[3rem] border-2 border-slate-100 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <Cpu className="w-48 h-48 text-slate-100 -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap className="w-3 h-3 fill-current" />
            Neural Synchronization Matrix
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase italic">Build your Strategic Neural Network</h2>
          <p className="text-slate-500 font-light max-w-lg italic mb-8">
            Connect any web-accessible interface into your GLOBAXYS command layer. 
            From Solto management to regional weather intelligence, unify your operational ecosystem through Human-AI collaboration.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest border-slate-200">
               Neural Marketplace
            </Button>
            <Button onClick={() => setShowAddApp(true)} className="bg-slate-900 text-white rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-400/20">
               Initialize Uplink
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
