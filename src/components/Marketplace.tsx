import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  ArrowRight, 
  Trophy, 
  CheckCircle2, 
  Mail,
  MoreVertical,
  Globe,
  Map as MapIcon,
  Languages,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Company } from '../types';
import { geminiService } from '../services/geminiService';
import { MOCK_COMPANIES } from '../data';

import { useTranslation, getLanguageName } from '../i18n';
import { toast } from 'sonner';

interface MarketplaceProps {
  onConnect?: (id: string) => void;
}

export default function Marketplace({ onConnect }: MarketplaceProps) {
  const { t, language } = useTranslation();
  const [search, setSearch] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});

  const handleTranslate = async (companyId: string, text: string) => {
    if (translations[companyId]) {
      const updated = { ...translations };
      delete updated[companyId];
      setTranslations(updated);
      return;
    }

    setTranslating(prev => ({ ...prev, [companyId]: true }));
    try {
      const translated = await geminiService.translateText(text, getLanguageName(language));
      setTranslations(prev => ({ ...prev, [companyId]: translated }));
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setTranslating(prev => ({ ...prev, [companyId]: false }));
    }
  };

  const filtered = MOCK_COMPANIES.filter(c => {
    const searchTerms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return true;
    
    const companyData = `${c.name} ${c.sector} ${c.description} ${c.country}`.toLowerCase();
    
    return searchTerms.every(term => companyData.includes(term));
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">{t('strategicHorizon')}</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">{t('globalOpportunities')}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder={t('searchNodesPlaceholder')} 
              className="pl-9 w-full theme-input uppercase font-bold tracking-widest text-[10px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((company) => (
          <div key={company.id} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-slate-400 transition-all duration-500">
            <div className={`h-1.5 w-full ${
              company.type === 'Supplier' ? 'bg-indigo-600' :
              company.type === 'Partner' ? 'bg-emerald-500' : 'bg-slate-900'
            }`} />
            
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xl border border-slate-100 text-slate-900 italic">
                  {company.name[0]}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-slate-100 text-[10px] font-black rounded-full border border-slate-200 uppercase tracking-tighter">
                    {company.type}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-2 text-[10px] font-bold text-slate-400">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span>4.9 {t('rating')}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {company.name}
                    {company.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-slate-900 -mt-1"
                    onClick={() => handleTranslate(company.id, company.description)}
                    disabled={translating[company.id]}
                  >
                    {translating[company.id] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Languages className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  <Globe className="w-3 h-3" />
                  {company.country} • {company.sector}
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed font-light italic mb-8 flex-1 transition-all duration-300">
                "{translations[company.id] || company.description}"
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-slate-900 text-white text-[10px] font-bold h-10 rounded-lg uppercase tracking-widest hover:bg-slate-800"
                  onClick={() => toast.success(`RFP Request queued for ${company.name}`)}
                >
                  {t('requestRfp')}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-lg h-10 w-10 border-slate-200 hover:border-slate-400 hidden sm:flex"
                  onClick={() => onConnect?.(company.id)}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                   className="rounded-lg h-10 border-slate-200 hover:border-slate-400 sm:hidden text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => onConnect?.(company.id)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('connect')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
          <Search className="w-10 h-10 text-slate-200 mx-auto mb-4" />
          <h3 className="text-slate-950 font-bold uppercase tracking-widest text-xs">{t('noNodesFound')}</h3>
          <p className="text-slate-400 text-[10px] font-medium tracking-tight mt-1 uppercase">{t('adjustParameters')}</p>
        </div>
      )}


      <div className="bg-slate-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <MapIcon className="w-full h-full scale-150" />
        </div>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <div className="w-20 h-20 rounded-full bg-white/10 mx-auto flex items-center justify-center backdrop-blur-md border border-white/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">{t('scaleOperationalCore')}</h3>
          <p className="text-slate-400 text-sm font-light leading-relaxed">{t('joinNetworkDesc')}</p>
          <div className="pt-4">
            <Button 
              className="rounded-full bg-white text-slate-950 px-8 md:px-12 h-12 font-bold uppercase tracking-widest hover:bg-slate-100 w-full sm:w-auto"
              onClick={() => toast.info(t('systemInputRequired'))}
            >
              {t('applyVerification')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
