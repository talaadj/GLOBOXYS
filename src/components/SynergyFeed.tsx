import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Heart, Share2, MoreHorizontal, ArrowUpRight, Languages, Loader2 } from 'lucide-react';
import { Post } from '../types';
import { geminiService } from '../services/geminiService';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    companyId: 'c1',
    companyName: 'EcoStream Tech',
    content: 'Seeking Tier-1 high-precision manufacturing partners for Indonesia market entry. Must satisfy Directive 2024 compliance frameworks.',
    timestamp: '2h ago',
    likes: 124,
    comments: 18,
    tags: ['MARKET_ENTRY', 'COMPLIANCE']
  },
  {
    id: '2',
    companyId: 'c2',
    companyName: 'Lumina Legal',
    content: 'Peringatan operasional: Peraturan bea cukai Indonesia diperbarui pada Q3. Pemetaan titik gesekan logistik untuk node APAC.',
    timestamp: '5h ago',
    likes: 89,
    comments: 42,
    tags: ['JURISDICTION', 'APAC']
  },
  {
    id: '3',
    companyId: 'c3',
    companyName: 'Solaris Infra',
    content: 'Wir suchen Partner für den Bau von Offshore-Windparks in der Nordsee. Fokus auf Kabellogistik und Netzanschluss.',
    timestamp: '8h ago',
    likes: 56,
    comments: 12,
    tags: ['ENERGY', 'EMEA']
  }
];

import { useTranslation, getLanguageName } from '../i18n';

interface SynergyFeedProps {
  onConnect?: (id: string) => void;
}

export default function SynergyFeed({ onConnect }: SynergyFeedProps) {
  const { t, language } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-end justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">{t('operationalPulse')}</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">{t('synergyDesc')}</p>
        </div>
        <div className="flex gap-2">
          {['TECH', 'ENERGY', 'LATAM'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-slate-100 text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-tighter">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {MOCK_POSTS.map((post) => (
          <div key={post.id} className="group p-6 theme-card flex flex-col md:flex-row items-start gap-6 hover:border-slate-400">
            <div className="flex-1">
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
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-light mb-4 italic transition-all duration-300">
                "{translations[post.id] || post.content}"
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-32 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col items-end gap-3 justify-center h-full">
               <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold uppercase text-blue-600 tracking-tighter">{t('highSynergy')}</p>
                  <p className="text-[9px] text-slate-400">94% {t('match')}</p>
               </div>
               <Button 
                 className="w-full bg-slate-900 text-white text-[10px] font-bold py-2 rounded uppercase tracking-widest hover:bg-slate-800 h-8"
                 onClick={() => onConnect?.(post.companyId)}
               >
                  {t('connect')}
               </Button>
               <div className="flex gap-4 w-full justify-center md:justify-end opacity-40 hover:opacity-100 transition-opacity">
                  <Heart className="w-3.5 h-3.5 cursor-pointer" />
                  <MessageSquare className="w-3.5 h-3.5 cursor-pointer" onClick={() => onConnect?.(post.companyId)} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
