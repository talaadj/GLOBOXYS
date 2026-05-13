import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CompanyProfile, Post } from '../types';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';
import { Zap, Globe, ShieldCheck, Rocket } from 'lucide-react';

interface NewInitiativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBroadcast?: (post: Post) => void;
}

export default function NewInitiativeDialog({ open, onOpenChange, onBroadcast }: NewInitiativeDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [brief, setBrief] = useState('');
  const [vector, setVector] = useState('market');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call and state sync
    setTimeout(() => {
      if (onBroadcast) {
        const newPost: Post = {
          id: `p${Date.now()}`,
          companyId: 'my-node',
          companyName: 'OmniCorp',
          content: `[STRATEGIC INITIATIVE: ${vector.toUpperCase()}]\nSUBJECT: ${subject}\n\n${brief}`,
          timestamp: 'Just now',
          likes: 0,
          comments: 0,
          tags: ['STRATEGY', vector.toUpperCase()],
          rating: 0,
          reactions: { '🚀': 1 }
        };
        onBroadcast(newPost);
      }

      setLoading(false);
      setSubject('');
      setBrief('');
      onOpenChange(false);
      toast.success(t('initiativeDescription'), {
        className: 'font-bold uppercase tracking-widest text-[10px]'
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200 p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-32 h-32" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic mb-2">
            {t('newInitiative')}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
            {t('initiativeDescription')}
          </DialogDescription>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-4">
            {t('classificationTopSecret')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t('vectorCategory')}
              </label>
              <Select value={vector} onValueChange={setVector}>
                <SelectTrigger className="h-12 bg-slate-50 border-slate-100 font-bold text-xs uppercase tracking-wider focus:ring-slate-900">
                  <SelectValue placeholder={t('selectVector')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market" className="text-xs font-bold uppercase tracking-widest">{t('marketEntry')}</SelectItem>
                  <SelectItem value="supply" className="text-xs font-bold uppercase tracking-widest">{t('supplyChainPivot')}</SelectItem>
                  <SelectItem value="legal" className="text-xs font-bold uppercase tracking-widest">{t('regulatoryAlignment')}</SelectItem>
                  <SelectItem value="talent" className="text-xs font-bold uppercase tracking-widest">{t('executiveMapping')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t('initiativeSubject')}
              </label>
              <Input 
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('initiativeSubjectPlaceholder')} 
                className="h-12 bg-slate-50 border-slate-100 font-bold text-xs uppercase tracking-wider focus:ring-slate-900" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t('strategicBrief')}
              </label>
              <Textarea 
                required
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={t('strategicBriefPlaceholder')} 
                className="min-h-[120px] bg-slate-50 border-slate-100 font-bold text-xs uppercase tracking-wider focus:ring-slate-900 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
             <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
             <p className="text-[10px] font-bold text-blue-900 leading-relaxed uppercase tracking-tight">
               {t('strategyEncryptionNote')}
             </p>
          </div>

          <DialogFooter className="pt-4 gap-3 sm:gap-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
            >
              {t('terminate')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-slate-950 text-white text-[10px] font-bold h-12 px-8 rounded-lg uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {t('initiating')}
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  {t('initializeStrategy')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
