import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Scale, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  Send, 
  Loader2, 
  Sparkles, 
  BookOpen,
  Users,
  Zap,
  ArrowRight,
  AlertTriangle,
  Globe,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import { AdvisoryTicket } from '../types';
import { Separator } from '@/components/ui/separator';
import { useTranslation, getLanguageName } from '../i18n';
import { toast } from 'sonner';

export default function AdvisoryHub() {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [history, setHistory] = useState<AdvisoryTicket[]>([]);
  const [category, setCategory] = useState<'Legal' | 'Economic' | 'Regulatory' | 'Customs'>('Legal');
  const [riskAssessment, setRiskAssessment] = useState<{ country: string; report: string } | null>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await geminiService.getBusinessAdvice(query, category, getLanguageName(language));
      const newTicket: AdvisoryTicket = {
        id: Math.random().toString(36).substr(2, 9),
        query,
        response,
        category,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory([newTicket, ...history]);
      setQuery('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskAssessment = async (country: string) => {
    setAssessing(true);
    try {
      const report = await geminiService.getJurisdictionRiskAssessment(country, getLanguageName(language));
      setRiskAssessment({ country, report });
    } catch (error) {
      console.error(error);
    } finally {
      setAssessing(false);
    }
  };

  const categories = [
    { id: 'Legal', icon: Scale, color: 'text-blue-500' },
    { id: 'Economic', icon: TrendingUp, color: 'text-emerald-500' },
    { id: 'Regulatory', icon: ShieldCheck, color: 'text-indigo-500' },
    { id: 'Customs', icon: BookOpen, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-h-[85vh]">
      <div className="lg:col-span-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">{t('advisory')}</h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">{t('advisoryDesc')}</p>
          </div>
          <Badge className="bg-slate-900 text-white gap-1.5 py-1 px-4 rounded-full text-[10px] font-bold tracking-widest uppercase w-fit">
            {t('unrestrictedAccess')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`p-5 rounded-xl border transition-all duration-300 text-left space-y-2 group ${
                category === cat.id 
                ? 'border-slate-900 bg-white shadow-xl ring-1 ring-slate-900/5' 
                : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <cat.icon className={`w-5 h-5 ${cat.color} group-hover:scale-110 transition-transform`} />
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 group-hover:text-slate-900">
                {t(cat.id as any)}
              </p>
            </button>
          ))}
        </div>

        <Card className="flex-1 flex flex-col border-slate-200 shadow-none overflow-hidden rounded-2xl min-h-[400px]">
          <CardContent className="flex-1 p-0 flex flex-col bg-white">
            <ScrollArea className="flex-1 p-8">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-24">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">{t('awaitingProbeSequence')}</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {history.map((ticket) => (
                    <div key={ticket.id} className="space-y-6">
                      <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 rounded bg-slate-950 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
                          <p className="text-sm font-bold text-slate-900">{ticket.query}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 items-start">
                        <div className="w-10 h-10 rounded border-2 border-slate-900 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-slate-900" />
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl rounded-tl-none prose prose-slate max-w-none shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                          <Badge variant="outline" className="mb-4 text-[9px] font-black tracking-widest uppercase bg-slate-50 border-slate-200">{ticket.category}</Badge>
                          <div className="text-sm leading-relaxed text-slate-600 italic whitespace-pre-wrap">"{ticket.response}"</div>
                          <Separator className="my-6 opacity-50" />
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t('nodeResponse')} :: {ticket.id} • {ticket.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200 ring-4 ring-slate-100/50">
                <Input 
                  placeholder={t('queryCore')} 
                  className="border-none focus-visible:ring-0 text-[10px] uppercase font-bold tracking-widest"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <Button 
                  onClick={handleAsk}
                  disabled={loading || !query.trim()}
                  className="bg-slate-950 text-white rounded-lg aspect-square p-0 w-10 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="lg:col-span-4 space-y-6">
        <Card className="border-slate-200 shadow-none bg-white p-6 rounded-2xl">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">{t('jurisdictionHealth')}</h3>
          <div className="space-y-6">
            {[
              { region: 'Brazil', status: 'In Review', level: 85, color: 'bg-blue-600' },
              { region: 'Indonesia', status: 'Compliant', level: 100, color: 'bg-emerald-500' },
              { region: 'Vietnam', status: 'Needs Assessment', level: 42, color: 'bg-amber-500' },
              { region: 'Saudi Arabia', status: 'Optimal', level: 95, color: 'bg-indigo-600' },
            ].map(reg => (
              <div 
                key={reg.region} 
                className="space-y-3 p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => handleRiskAssessment(reg.region)}
              >
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-900 group-hover:text-blue-600 transition-colors">{reg.region}</span>
                  <span className={reg.level < 50 ? 'text-amber-600 underline' : 'text-slate-400'}>{reg.status}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${reg.level}%` }}
                    className={`h-full ${reg.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
             <Button 
              variant="outline" 
              className="w-full h-10 border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900"
              onClick={() => handleRiskAssessment('Global Market Summary')}
              disabled={assessing}
             >
               {assessing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Globe className="w-3 h-3 mr-2" />}
               {t('probeNewNode')}
             </Button>
          </div>
        </Card>

        <Card className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-2">Vandoris Guard</p>
          <p className="text-sm leading-relaxed font-light italic mb-6">{t('activeShieldVerified')}</p>
          <button 
            className="w-full py-3 bg-white text-slate-950 text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-slate-100 transition-colors"
            onClick={() => toast.success('Vandoris Protocol Status: Nominal')}
          >
            {t('protocolOverview')}
          </button>
        </Card>
      </aside>

      <AnimatePresence>
        {riskAssessment && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setRiskAssessment(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-950 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">{t('intelligenceNodeCore')} :: {riskAssessment.country}</span>
                </div>
                <button onClick={() => setRiskAssessment(null)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <ScrollArea className="h-[60vh] p-10">
                <div className="prose prose-slate max-w-none prose-sm font-sans">
                  <div className="markdown-body text-slate-600 font-light italic leading-relaxed">
                    <Markdown>{riskAssessment.report}</Markdown>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{t('classificationTopSecret')}</p>
                 <Button 
                   onClick={() => setRiskAssessment(null)}
                   className="bg-slate-900 text-white rounded-lg h-9 px-6 text-[10px] uppercase font-bold tracking-widest"
                 >
                   {t('acknowledge')}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
