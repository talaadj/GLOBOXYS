import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, DollarSign, Clock, Filter, UserPlus, Sparkles, Users, Briefcase, ArrowRight } from 'lucide-react';
import { Job } from '../types';
import { MOCK_JOBS } from '../data';

import { useTranslation } from '../i18n';
import { toast } from 'sonner';

export default function TalentHub() {
  const { t } = useTranslation();
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">{t('talent')}</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">{t('talentDesc')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="rounded-lg h-10 px-6 font-bold text-[10px] uppercase tracking-widest border-slate-200 flex-1 sm:flex-none"
            onClick={() => toast.info('Executive Search initialized')}
          >
            {t('executiveSearch')}
          </Button>
          <Button 
            className="bg-slate-900 text-white rounded-lg h-10 px-8 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 flex-1 sm:flex-none"
            onClick={() => toast.success('RFP posting module activated')}
          >
            {t('postRfp')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <h4 className="theme-label">{t('probeParameters')}</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input placeholder={t('roleKeywordsPlaceholder')} className="pl-9 theme-input uppercase font-bold tracking-widest text-[9px]" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="theme-label">{t('activeRoles')}</h4>
            <ul className="space-y-4">
              {[
                { title: 'Market Entry: Indonesia', label: 'Logistics & Legal Mapping', color: 'bg-blue-600' },
                { title: 'Supplier Optimization', label: 'Alternative Energy Source', color: 'bg-slate-200' },
              ].map(obj => (
                <li key={obj.title} className="flex items-start gap-4">
                  <div className={`w-1 h-10 ${obj.color} rounded-full`} />
                  <div>
                    <p className="text-sm font-bold text-slate-950">{obj.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{obj.label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="lg:col-span-9 space-y-8">
          <div className="theme-card overflow-hidden">
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100 italic">
                    <TableHead className="theme-label py-4 pl-6 text-slate-950">{t('specialization')}</TableHead>
                    <TableHead className="theme-label py-4 text-slate-950">{t('organization')}</TableHead>
                    <TableHead className="theme-label py-4 text-slate-950">{t('jurisdiction')}</TableHead>
                    <TableHead className="theme-label py-4 text-slate-950">{t('compensation')}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_JOBS.map((job) => (
                    <TableRow key={job.id} className="hover:bg-slate-50 transition-colors border-slate-100 group">
                      <TableCell className="pl-6 py-6 transition-transform group-hover:translate-x-1 duration-300">
                        <div className="font-bold text-slate-950">{job.title}</div>
                        <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 border border-slate-100 px-1.5 rounded opacity-60">
                          {job.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 text-sm font-light italic">{job.companyName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="text-sm font-bold text-slate-900">{job.salary}</div>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-slate-100 rounded-lg text-slate-400"
                          onClick={() => toast.info(`Viewing ${job.title}`)}
                        >
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile View Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {MOCK_JOBS.map((job) => (
                <div key={job.id} className="p-6 space-y-4 active:bg-slate-50" onClick={() => toast.info(`Viewing ${job.title}`)}>
                   <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-950">{job.title}</div>
                      <p className="text-xs text-slate-500 italic mt-0.5">{job.companyName}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest h-5">{job.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                    <div className="text-slate-900">{job.salary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            <div className="p-8 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tighter text-slate-950 mb-3">{t('contractorPool')}</h3>
                <p className="text-sm font-light text-slate-500 italic mb-6">{t('contractorPoolDesc')}</p>
                <Button 
                  className="rounded-lg h-9 px-8 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 w-full sm:w-auto"
                  onClick={() => toast.info('Searching Global Matrix...')}
                >
                  {t('searchMatrix')}
                </Button>
              </div>
              <Briefcase className="absolute -right-8 -bottom-8 w-40 h-40 text-slate-50 opacity-10 rotate-12 transition-transform group-hover:scale-110 duration-700" />
            </div>

            <div className="p-8 bg-slate-900 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold tracking-tighter text-white mb-3">{t('aiRecruitment')}</h3>
                  <p className="text-sm font-light text-slate-400 italic mb-6">{t('aiRecruitmentDesc')}</p>
                  <Button 
                    className="rounded-lg h-9 px-8 bg-white text-slate-950 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 w-full sm:w-auto"
                    onClick={() => toast.loading('Initializing AI Probe sequence...')}
                  >
                    {t('executeProbe')}
                  </Button>
                </div>
               <Sparkles className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5 rotate-45" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
