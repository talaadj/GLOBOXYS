import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Smartphone, 
  Globe, 
  Award, 
  ShieldCheck, 
  ArrowUpRight, 
  Target, 
  Zap,
  BarChart3,
  QrCode,
  Download,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation, getLanguageName } from '../i18n';
import { Progress } from "@/components/ui/progress";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export default function GrowthHub() {
  const { t, language } = useTranslation();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const growthSteps = [
    { title: t('Global Presence' as any) || 'Global Presence', value: '42%', icon: Globe, color: 'text-blue-600' },
    { title: t('Partner Network' as any) || 'Partner Network', value: '850+', icon: Users, color: 'text-indigo-600' },
    { title: t('ROI Efficiency' as any) || 'ROI Efficiency', value: '+18.4%', icon: TrendingUp, color: 'text-emerald-600' },
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("GLOBAXYS", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(t('reportGeneratedBy'), 14, 26);
      doc.text(timestamp, 150, 26);

      // Title
      doc.setFontSize(18);
      doc.setTextColor(30, 64, 175); // blue-800
      doc.text(t('monthlyReportTitle'), 14, 40);

      // Summary text
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // slate-700
      const summaryLines = doc.splitTextToSize(t('reportStrategicSummary'), 180);
      doc.text(summaryLines, 14, 50);

      // Core Metrics Table
      autoTable(doc, {
        startY: 65,
        head: [[t('Metric'), t('Value'), t('Status')]],
        body: [
          [t('impactScore'), "8,420 SYNERGY PTS", "Level 84"],
          [t('partnerGrowth'), "850+", "+12.5% MoM"],
          [t('efficiencyGains'), "+18.4%", "Optimized"],
          ["Global Reach", "42%", "Expansion Active"],
          ["Growth Phase", "Phase 4", "Stable"],
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      // Operational Details
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Operational Parameters", 14, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        body: [
          [t('latencyNodeOpt'), "99.8%"],
          [t('jurisdictionalSpeed'), "4s"],
          [t('talentSaturation'), "92%"],
          [t('creditsGenerated'), "$12,500"],
        ],
        styles: { fontSize: 9 }
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text("© 2026 GLOBAXYS ECOSYSTEM - ENCRYPTED STRATEGIC EXPORT", 14, doc.internal.pageSize.height - 10);

      doc.save(`GLOBAXYS_Growth_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Report generated and downloaded successfully.");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md pt-8 pb-4 -mt-8 mb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-slate-900 rounded-full animate-pulse" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('growthEngine')}</h1>
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">Strategic Expansion & Ecosystem Multiplication Protocol</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={generateReport} 
            disabled={isGenerating}
            variant="outline" 
            className="h-10 px-6 border-slate-200 text-slate-700 bg-white shadow-sm hover:bg-slate-50 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-blue-600" />
            )}
            {t('downloadMonthlyReport')}
          </Button>
          <Badge variant="outline" className="h-10 px-4 border-emerald-500 text-emerald-600 bg-emerald-50 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Growth Phase 4 Active</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Impact Score Card */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xl shadow-slate-100 overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-48 h-48" />
           </div>
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  {t('impactScore')}
                </CardTitle>
                <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-tighter">Level 84</Badge>
             </div>
             <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black italic tracking-tighter">8,420</span>
                  <span className="text-emerald-500 text-lg font-bold">SYNERGY PTS</span>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Top 5% of Global Strategic Nodes</p>
             </div>
           </CardHeader>
           <CardContent className="space-y-6 pt-4">
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>{t('nextMilestone')}</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2 bg-slate-100" />
             </div>
             <div className="grid grid-cols-3 gap-4">
                {growthSteps.map((step, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <step.icon className={`w-4 h-4 ${step.color} mb-3`} />
                    <p className="text-2xl font-black italic leading-none">{step.value}</p>
                    <p className="text-[8px] font-bold uppercase text-slate-400 mt-1">{step.title}</p>
                  </div>
                ))}
             </div>
           </CardContent>
        </Card>

        {/* Mobile Sync App Ad */}
        <Card className="bg-slate-900 border-none text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent" />
           <CardHeader className="relative z-10">
             <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-blue-400">
                <Smartphone className="w-4 h-4" />
                {t('mobileApp')}
             </CardTitle>
             <div className="mt-8">
               <h3 className="text-3xl font-black italic tracking-tighter leading-tight">{t('commandLayerPocket')}</h3>
             </div>
           </CardHeader>
           <CardContent className="relative z-10 space-y-8">
             <div className="flex items-center gap-4 py-4 border-y border-white/10">
                <div className="w-16 h-16 bg-white p-2 rounded-xl flex items-center justify-center">
                   <QrCode className="w-full h-full text-slate-950" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('scanToSync')}</p>
                   <p className="text-xs font-light italic">{t('universalBridge')}</p>
                </div>
             </div>
             <Button className="w-full h-12 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 hover:bg-blue-50">
                <Download className="w-4 h-4" />
                {t('downloadApp')}
             </Button>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Partner Program */}
        <Card className="border-slate-200 hover:border-blue-200 transition-colors cursor-pointer group">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              {t('partnerProgram')}
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest mt-2">{t('ecosystemValue')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
               <div className="space-y-1">
                 <p className="text-3xl font-black italic">$12,500</p>
                 <p className="text-[8px] font-bold uppercase text-slate-400">{t('creditsGenerated')}</p>
               </div>
               <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:border-blue-200">
                 <ArrowUpRight className="w-6 h-6 text-blue-600" />
               </div>
            </div>
            <p className="text-[9px] text-slate-400 italic mt-4 text-center">{t('referralBonus')}</p>
          </CardContent>
        </Card>

        {/* Global Scaling Protocol */}
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden border-l-4 border-l-blue-600">
           <CardHeader>
             <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
               <BarChart3 className="w-4 h-4 text-slate-900" />
               {t('scalingProtocol')}
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             {[
               { label: t('latencyNodeOpt'), value: '99.8%', color: 'bg-emerald-500' },
               { label: t('jurisdictionalSpeed'), value: '4s', color: 'bg-blue-500' },
               { label: t('talentSaturation'), value: '92%', color: 'bg-indigo-500' },
             ].map((node, i) => (
               <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                 <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600">{node.label}</span>
                 <div className="flex items-center gap-3">
                   <div className={`w-1.5 h-1.5 rounded-full ${node.color} animate-pulse`} />
                   <span className="text-[10px] font-black text-slate-900 font-mono">{node.value}</span>
                 </div>
               </div>
             ))}
           </CardContent>
        </Card>
      </div>

      <div className="rounded-[2.5rem] bg-indigo-600 p-12 text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="flex-1 space-y-6 relative z-10">
          <Badge className="bg-indigo-400 text-white border-none uppercase text-[8px] font-black tracking-widest px-3 py-1">{t('entrepreneursChoice')}</Badge>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">{t('elevateMatrix')}</h2>
          <p className="text-indigo-100 font-light italic max-w-lg">{t('joinNetworkGrowth')}</p>
          <div className="flex gap-4">
            <Button className="h-12 px-8 bg-white text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 shadow-xl">{t('startScaling')}</Button>
            <Button variant="outline" className="h-12 px-8 border-indigo-400 text-white hover:bg-indigo-500 font-black uppercase text-[10px] tracking-widest">{t('connectAdvisor')}</Button>
          </div>
        </div>
        <div className="w-full md:w-64 aspect-square bg-indigo-500 rounded-3xl rotate-12 flex items-center justify-center border border-indigo-400 shadow-2xl relative z-10">
           <Globe className="w-32 h-32 text-indigo-200" />
           <div className="absolute -bottom-4 -left-4 bg-white text-indigo-600 p-4 rounded-xl shadow-xl rotate-[-12deg]">
             <p className="text-[8px] font-black uppercase tracking-widest">Active nodes</p>
             <p className="text-xl font-black italic tracking-tighter leading-none mt-1">GLOBAL_v4.2</p>
           </div>
        </div>
      </div>
    </div>
  );
}
