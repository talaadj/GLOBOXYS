import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'motion/react';
import { 
  Globe2, 
  Search, 
  Loader2, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Map as MapIcon,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import { useTranslation, getLanguageName } from '../i18n';
import { toast } from 'sonner';

export default function ExpansionTool() {
  const { t, language } = useTranslation();
  const [product, setProduct] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!product || !country) {
      toast.error('Parameters incomplete');
      return;
    }
    setLoading(true);
    toast.loading('Initializing market intelligence probe...', { id: 'market-analysis' });
    try {
      const result = await geminiService.analyzeMarket(product, country, getLanguageName(language));
      setAnalysis(result);
      toast.success('Market analysis synthesized', { id: 'market-analysis' });
    } catch (error) {
      console.error(error);
      toast.error('Strategy extraction failed', { id: 'market-analysis' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">{t('marketIntelligence')}</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">{t('marketIntelligenceDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-6">
          <Card className="p-8 theme-card space-y-6">
            <div className="space-y-4">
              <label className="theme-label block">{t('probeTarget')}</label>
              <Input 
                placeholder={t('productServicePlaceholder')} 
                className="theme-input uppercase font-bold tracking-widest text-[9px] h-10"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <label className="theme-label block">{t('targetNode')}</label>
              <Input 
                placeholder={t('countryJurisdictionPlaceholder')} 
                className="theme-input uppercase font-bold tracking-widest text-[9px] h-10"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <Button 
              className="w-full bg-slate-900 text-white rounded-xl h-12 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800"
              onClick={handleAnalyze}
              disabled={loading || !product || !country}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe2 className="w-4 h-4" />}
              {t('launchSearch')}
            </Button>
          </Card>

          <Card className="p-8 theme-card space-y-6">
            <h4 className="theme-label">{t('projectedSynergies')}</h4>
            {[
              { nation: 'Vietnam', sector: 'Manufacturing', growth: '+8.2%' },
              { nation: 'Saudi Arabia', sector: 'Renewables', growth: '+12.5%' },
              { nation: 'Poland', sector: 'Software Dev', growth: '+6.1%' },
            ].map(m => (
              <div key={m.nation} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900">{m.nation}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.sector}</p>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 text-[10px] font-bold">
                  {m.growth}
                </Badge>
              </div>
            ))}
          </Card>
        </aside>

        <section className="lg:col-span-8">
          {analysis ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="theme-card overflow-hidden bg-white">
                <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">{t('intelligenceNodeReport')} :: {product}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/20 hover:bg-white/10 h-8 text-[9px] font-bold uppercase tracking-widest"
                    onClick={() => toast.success('Strategy core exported')}
                  >
                    {t('exportCore')}
                  </Button>
                </div>
                <div className="p-10 prose prose-slate max-w-none prose-sm font-sans">
                  <div className="markdown-body text-slate-600 font-light italic leading-relaxed">
                    <Markdown>{analysis}</Markdown>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: ShieldCheck, label: t('riskMapping'), value: t('lowFriction'), color: 'text-emerald-500' },
                  { icon: BarChart3, label: t('profitProjection'), value: t('highYield'), color: 'text-blue-600' },
                  { icon: MapIcon, label: t('localConnectivity'), value: t('vettedPartners'), color: 'text-indigo-600' },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 theme-card flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 italic transition-transform hover:scale-110">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="theme-label">{item.label}</h4>
                      <p className="text-lg font-bold text-slate-950 italic">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-white/50 relative overflow-hidden group">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl mb-8 group-hover:scale-110 transition-transform duration-700">
                <Globe2 className="w-10 h-10 text-slate-200 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter text-slate-950 mb-3 uppercase italic">{t('systemInputRequired')}</h3>
              <p className="text-slate-400 text-sm font-light italic max-w-sm mb-10 leading-relaxed">
                {t('systemInputDesc')}
              </p>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 text-left shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">{t('phase01')}</h4>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{t('phase01Desc')}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 text-left shadow-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">{t('phase02')}</h4>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{t('phase02Desc')}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
