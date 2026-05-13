import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Building2, 
  Briefcase, 
  Scale, 
  LayoutGrid, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { MOCK_POSTS, MOCK_COMPANIES, MOCK_JOBS, MOCK_ADVISORY_TOPICS } from '../data';
import { useTranslation } from '../i18n';
import { Badge } from '@/components/ui/badge';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (tab: string, itemId?: string) => void;
}

export default function GlobalSearch({ open, onOpenChange, onNavigate }: GlobalSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = [
    { id: 'companies', label: t('marketplace'), icon: Building2 },
    { id: 'jobs', label: t('talent'), icon: Briefcase },
    { id: 'advisories', label: t('advisory'), icon: Scale },
    { id: 'posts', label: t('dashboard'), icon: LayoutGrid },
  ];

  const results = useMemo(() => {
    if (!query.trim() && !categoryFilter) return null;
    const q = query.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);

    const matches = (text: string) => words.every(word => text.toLowerCase().includes(word));

    const companies = (categoryFilter === null || categoryFilter === 'companies') 
      ? MOCK_COMPANIES.filter(c => matches(`${c.name} ${c.sector} ${c.description} ${c.country}`))
      : [];

    const jobs = (categoryFilter === null || categoryFilter === 'jobs')
      ? MOCK_JOBS.filter(j => matches(`${j.title} ${j.companyName} ${j.location}`))
      : [];

    const advisories = (categoryFilter === null || categoryFilter === 'advisories')
      ? MOCK_ADVISORY_TOPICS.filter(a => matches(`${a.title} ${a.content} ${a.category}`))
      : [];

    const posts = (categoryFilter === null || categoryFilter === 'posts')
      ? MOCK_POSTS.filter(p => matches(`${p.content} ${p.companyName} ${p.tags.join(' ')}`))
      : [];

    return { companies, jobs, advisories, posts };
  }, [query, categoryFilter]);

  const hasResults = results && (
    results.companies.length > 0 || 
    results.jobs.length > 0 || 
    results.advisories.length > 0 || 
    results.posts.length > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-slate-200">
        <DialogHeader className="p-4 border-b border-slate-100 bg-white">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder={t('searchNodesPlaceholder')} 
                className="pl-10 h-11 border-none focus-visible:ring-0 text-sm font-bold uppercase tracking-widest placeholder:text-slate-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                  categoryFilter === null 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                }`}
              >
                {t('all')}
              </button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
                      categoryFilter === cat.id 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {!query.trim() ? (
            <div className="p-8 text-center opacity-40">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('awaitingProbeSequence')}</p>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center opacity-40">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('noNodesFound')}</p>
            </div>
          ) : (
            <div className="p-4 space-y-8">
              {results.companies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="theme-label px-2 flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    {t('marketplace')}
                  </h3>
                  <div className="grid gap-2">
                    {results.companies.map(company => (
                      <button 
                        key={company.id}
                        onClick={() => {
                          onNavigate('marketplace');
                          onOpenChange(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{company.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-0.5">{company.sector} • {company.country}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.jobs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="theme-label px-2 flex items-center gap-2">
                    <Briefcase className="w-3 h-3" />
                    {t('talent')}
                  </h3>
                  <div className="grid gap-2">
                    {results.jobs.map(job => (
                      <button 
                        key={job.id}
                        onClick={() => {
                          onNavigate('talent');
                          onOpenChange(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight mt-0.5">{job.companyName} • {job.location}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.advisories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="theme-label px-2 flex items-center gap-2">
                    <Scale className="w-3 h-3" />
                    {t('advisory')}
                  </h3>
                  <div className="grid gap-2">
                    {results.advisories.map(topic => (
                      <button 
                        key={topic.id}
                        onClick={() => {
                          onNavigate('advisory');
                          onOpenChange(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{topic.title}</p>
                            <Badge variant="outline" className="text-[8px] h-4 uppercase tracking-widest">{topic.category}</Badge>
                          </div>
                          <p className="text-[10px] text-slate-400 font-light italic truncate max-w-md mt-0.5">"{topic.content}"</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.posts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="theme-label px-2 flex items-center gap-2">
                    <LayoutGrid className="w-3 h-3" />
                    {t('dashboard')}
                  </h3>
                  <div className="grid gap-2">
                    {results.posts.map(post => (
                      <button 
                        key={post.id}
                        onClick={() => {
                          onNavigate('feed');
                          onOpenChange(false);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{post.companyName}</p>
                          <p className="text-[10px] text-slate-400 font-light italic truncate max-w-md mt-0.5">"{post.content}"</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
           <span>{t('classificationTopSecret')}</span>
           <div className="flex gap-4">
             <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm">ESC</kbd> {t('close')}</span>
             <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm">ENTER</kbd> {t('select')}</span>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
