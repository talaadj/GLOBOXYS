import React, { useState, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Tag, 
  Users, 
  Camera, 
  Save,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CompanyProfile } from '../types';
import { INDUSTRY_SECTORS } from '../constants';
import { motion } from 'motion/react';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';

interface ProfileEditorProps {
  profile: CompanyProfile;
  onSave: (profile: CompanyProfile) => void;
}

export default function ProfileEditor({ profile, onSave }: ProfileEditorProps) {
  const { t } = useTranslation();
  const [editedProfile, setEditedProfile] = useState<CompanyProfile>(profile);
  const [newJurisdiction, setNewJurisdiction] = useState('');
  const [newCapability, setNewCapability] = useState('');
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLogoError(null);

    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setLogoError(t('invalidFormatError'));
        return;
      }

      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setLogoError(t('fileTooLargeError'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (field: 'jurisdictions' | 'capabilities', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      setEditedProfile(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: 'jurisdictions' | 'capabilities', index: number) => {
    setEditedProfile(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const onProfileSave = () => {
    onSave(editedProfile);
    toast.success('Organization parameters synchronized with global nodes');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950">{t('organizationalIdentity')}</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">{t('configureGlobalNodeParameters')}</p>
        </div>
        <Button 
          onClick={onProfileSave}
          className="bg-slate-900 text-white rounded-lg h-10 px-8 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 w-full md:w-auto"
        >
          <Save className="w-3.5 h-3.5 mr-2" />
          {t('saveProfile')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Visual Identity */}
        <section className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h4 className="theme-label">{t('visualStamp')}</h4>
            <div className="relative group">
              <div 
                className="w-full aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-slate-400 group-hover:bg-white cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {editedProfile.logo ? (
                  <img src={editedProfile.logo || undefined} alt="Logo" className="w-full h-full object-contain p-8" referrerPolicy="no-referrer" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('uploadKey')}</p>
                  </>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="ghost" className="text-white text-[10px] font-bold uppercase tracking-widest">
                    {t('updateNodeLogo')}
                  </Button>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/jpeg, image/png, image/gif"
              />
            </div>
            
            <div className={`p-4 rounded-xl border flex items-center justify-between ${editedProfile.isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-3">
                {editedProfile.isVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${editedProfile.isVerified ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {editedProfile.isVerified ? t('verifiedNode') : t('unverifiedNode')}
                  </p>
                  {!editedProfile.isVerified && (
                    <button className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter hover:underline mt-0.5">
                      {t('applyVerification')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {logoError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-100 rounded-lg"
              >
                <AlertCircle className="w-3 h-3 text-red-500" />
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest leading-none">
                  {logoError}
                </p>
              </motion.div>
            )}
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-2xl relative overflow-hidden">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-2">{t('securityNote')}</p>
            <p className="text-xs leading-relaxed font-light italic opacity-80">
              {t('organizationMetadataDesc')}
            </p>
            <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 text-white/5 rotate-12" />
          </div>
        </section>

        {/* Right Side: Data Matrix */}
        <section className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="theme-label">{t('organizationNameLabel')}</label>
              <Input 
                name="name" 
                value={editedProfile.name} 
                onChange={handleInputChange}
                className="theme-input font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="theme-label">{t('sectorAxis')}</label>
              <Select 
                value={editedProfile.sector} 
                onValueChange={(value) => setEditedProfile(prev => ({ ...prev, sector: value }))}
              >
                <SelectTrigger className="theme-input font-bold uppercase tracking-widest w-full">
                  <SelectValue placeholder={t('selectSectorPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_SECTORS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="theme-label">{t('taglineLabel')}</label>
              <Input 
                name="tagline" 
                value={editedProfile.tagline} 
                onChange={handleInputChange}
                className="theme-input italic font-light"
              />
            </div>
            <div className="space-y-2">
              <label className="theme-label">{t('hqLabel')}</label>
              <Input 
                name="hq" 
                value={editedProfile.hq} 
                onChange={handleInputChange}
                className="theme-input font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="theme-label">{t('contactEmail')}</label>
              <Input 
                name="email" 
                type="email"
                value={editedProfile.email} 
                onChange={handleInputChange}
                placeholder="contact@company.com"
                className="theme-input font-bold uppercase tracking-tight"
              />
            </div>
            <div className="space-y-2">
              <label className="theme-label">{t('websiteUrl')}</label>
              <Input 
                name="website" 
                value={editedProfile.website} 
                onChange={handleInputChange}
                placeholder="https://company.com"
                className="theme-input font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="theme-label">{t('descriptionLabel')}</label>
            <Textarea 
              name="description" 
              value={editedProfile.description} 
              onChange={handleInputChange}
              className="theme-input min-h-[120px] italic font-light leading-relaxed"
              placeholder={t('describeMissionPlaceholder')}
            />
          </div>

          <Separator className="opacity-50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="theme-label flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                {t('jurisdictionsLabel')}
              </h4>
              <div className="flex gap-2">
                <Input 
                  value={newJurisdiction} 
                  onChange={(e) => setNewJurisdiction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('jurisdictions', newJurisdiction, setNewJurisdiction)}
                  placeholder={t('addCountryPlaceholder')}
                  className="theme-input text-[10px] font-bold tracking-widest uppercase h-9"
                />
                <Button 
                  onClick={() => addItem('jurisdictions', newJurisdiction, setNewJurisdiction)}
                  variant="outline" className="h-9 px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedProfile.jurisdictions.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200 px-3 py-1 flex items-center gap-2">
                    {item}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('jurisdictions', idx)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
            <h4 className="theme-label flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {t('capabilitiesLabel')}
              </h4>
              <div className="flex gap-2">
                <Input 
                  value={newCapability} 
                  onChange={(e) => setNewCapability(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem('capabilities', newCapability, setNewCapability)}
                  placeholder={t('addSkillPlaceholder')}
                  className="theme-input text-[10px] font-bold tracking-widest uppercase h-9"
                />
                <Button 
                  onClick={() => addItem('capabilities', newCapability, setNewCapability)}
                  variant="outline" className="h-9 px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedProfile.capabilities.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="border-slate-300 text-slate-400 text-[10px] font-bold uppercase tracking-tighter px-3 py-1 flex items-center gap-2">
                    {item}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem('capabilities', idx)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
