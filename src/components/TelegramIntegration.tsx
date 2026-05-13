import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  MessageSquare, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Plus,
  Zap,
  Cpu,
  Terminal,
  Activity,
  UserPlus,
  Users,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '@/src/i18n';

interface AgentRule {
  id: string;
  keyword: string;
  response: string;
}

interface Agent {
  id: string;
  name: string;
  type: 'analyst' | 'growth' | 'custom';
  status: 'active' | 'offline';
  rules: AgentRule[];
}

interface TelegramMessage {
  id: number;
  from: string;
  text: string;
  timestamp: string;
  chatTitle: string;
}

export default function TelegramIntegration() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ active: false, botUsername: 'Unknown' });
  const [activeTab, setActiveTab] = useState('hub');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');
  
  const [editingRule, setEditingRule] = useState<{agentId: string, ruleId: string, keyword: string, response: string} | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/telegram/messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to sync Telegram matrix');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/telegram/agents');
      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStatus();
    fetchAgents();
    const interval = setInterval(fetchMessages, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const handleAddAgent = async () => {
    try {
      const res = await fetch('/api/telegram/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Strategy Unit', type: 'custom' })
      });
      const newAgent = await res.json();
      setAgents([...agents, newAgent]);
      toast.success(t('addAgent'), {
        description: 'New autonomous node registered in the nexus.'
      });
    } catch (error) {
      toast.error('Deployment failure');
    }
  };

  const toggleAgentStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'offline' : 'active';
      const res = await fetch(`/api/telegram/agents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setAgents(agents.map(a => a.id === id ? updated : a));
      toast.success(`${updated.name} is now ${newStatus}`);
    } catch (error) {
      toast.error('Status transition failed');
    }
  };

  const handleAddRule = async (agentId: string) => {
    if (!newKeyword.trim() || !newResponse.trim()) return;
    try {
      const res = await fetch(`/api/telegram/agents/${agentId}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword, response: newResponse })
      });
      const rule = await res.json();
      setAgents(agents.map(a => {
        if (a.id === agentId) {
          return { ...a, rules: [...a.rules, rule] };
        }
        return a;
      }));
      setNewKeyword('');
      setNewResponse('');
      toast.success(t('addRule'));
    } catch (error) {
      toast.error('Rule encryption failed');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await fetch(`/api/telegram/agents/${id}`, { method: 'DELETE' });
      setAgents(agents.filter(a => a.id !== id));
      toast.success('Strategy unit decommissioned');
    } catch (error) {
      toast.error('Decommissioning failed');
    }
  };

  const handleDeleteRule = async (agentId: string, ruleId: string) => {
    try {
      await fetch(`/api/telegram/agents/${agentId}/rules/${ruleId}`, { method: 'DELETE' });
      setAgents(agents.map(a => {
        if (a.id === agentId) {
          return { ...a, rules: a.rules.filter(r => r.id !== ruleId) };
        }
        return a;
      }));
      toast.success('Neural rule purged');
    } catch (error) {
      toast.error('Purge failed');
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;
    try {
      const res = await fetch(`/api/telegram/agents/${editingRule.agentId}/rules/${editingRule.ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: editingRule.keyword, response: editingRule.response })
      });
      const updatedRule = await res.json();
      setAgents(agents.map(a => {
        if (a.id === editingRule.agentId) {
          return {
            ...a,
            rules: a.rules.map(r => r.id === editingRule.ruleId ? updatedRule : r)
          };
        }
        return a;
      }));
      setEditingRule(null);
      toast.success('Neural rule updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-indigo-600 rounded-full animate-pulse" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">{t('telegram')}</h1>
          </div>
          <p className="text-slate-500 text-sm uppercase tracking-widest font-medium">Human-AI Collaborative Channel Synchronization & Operational Protocol</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
            <Users className="w-3 h-3 text-indigo-600" />
            <div className="w-1 h-1 bg-indigo-400 rounded-full" />
            <Bot className="w-3 h-3 text-indigo-600" />
            <span className="text-[8px] font-black uppercase text-indigo-600 ml-1 tracking-tighter">Sync Active</span>
          </div>
          <Badge variant={status.active ? "outline" : "secondary"} className={`h-7 px-3 flex items-center gap-2 ${status.active ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : ''}`}>
            <Activity className={`w-3 h-3 ${status.active ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {status.active ? 'Neural Link Live' : 'Offline Mode'}
            </span>
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-4 gap-2 border-slate-200"
            onClick={fetchMessages}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Force Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Feed */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200 overflow-hidden theme-card bg-white shadow-none">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600 fill-current" />
                    Human-AI Synchronization Hub
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">AI_ADVISOR_ONLINE</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {status.botUsername && `@${status.botUsername}`}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-slate-100">
                  {loading && messages.length === 0 ? (
                    <div className="p-12 text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-slate-200 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Synchronizing data nodes...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-12 text-center">
                      <ShieldCheck className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No telemetry detected in this nexus.</p>
                      <p className="text-xs text-slate-400 mt-2 italic font-light">Send a message to your bot to initialize the link.</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={msg.id} 
                        className="p-6 hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black text-slate-600 italic">
                              {msg.from.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-950">@{msg.from}</p>
                                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{msg.chatTitle}</p>
                            </div>
                          </div>
                          <p className="text-[9px] font-mono text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-slate-600 font-light italic pl-11 group-hover:text-slate-900 transition-colors">
                          "{msg.text}"
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Agents & Tools */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 theme-card bg-white shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    {t('deploymentHub')}
                  </CardTitle>
               </div>
               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddAgent}>
                  <Plus className="w-3.5 h-3.5" />
               </Button>
            </CardHeader>
            <CardContent className="space-y-4">
               {agents.map(agent => (
                 <div key={agent.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {agent.type === 'analyst' ? <Cpu className="w-3.5 h-3.5 text-blue-600" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="text-[10px] font-black uppercase">{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          onClick={() => toggleAgentStatus(agent.id, agent.status)}
                          className={`cursor-pointer text-[8px] font-black px-1.5 h-4 ${agent.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                        >
                          {agent.status.toUpperCase()}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteAgent(agent.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('rules')} ({agent.rules.length})</p>
                      <div className="space-y-1">
                        {agent.rules.map(rule => (
                          <div key={rule.id} className="group/rule flex items-center justify-between text-[10px] bg-white p-1.5 rounded border border-slate-100">
                             {editingRule?.ruleId === rule.id ? (
                               <div className="flex flex-col gap-1 w-full mr-2">
                                 <Input 
                                   value={editingRule.keyword}
                                   onChange={(e) => setEditingRule({...editingRule, keyword: e.target.value})}
                                   className="h-6 text-[10px] font-bold py-0"
                                 />
                                 <Input 
                                   value={editingRule.response}
                                   onChange={(e) => setEditingRule({...editingRule, response: e.target.value})}
                                   className="h-6 text-[10px] italic py-0"
                                 />
                               </div>
                             ) : (
                               <div className="flex flex-col">
                                 <span className="font-mono text-blue-600 font-bold">{rule.keyword}</span>
                                 <span className="text-[9px] text-slate-400 italic line-clamp-1">{rule.response}</span>
                               </div>
                             )}
                             
                             <div className="flex items-center gap-1 opacity-0 group-hover/rule:opacity-100 transition-opacity">
                               {editingRule?.ruleId === rule.id ? (
                                 <>
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-5 w-5 text-emerald-600 hover:bg-emerald-50"
                                     onClick={handleUpdateRule}
                                   >
                                     <Check className="w-3 h-3" />
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-5 w-5 text-slate-400 hover:bg-slate-100"
                                     onClick={() => setEditingRule(null)}
                                   >
                                     <X className="w-3 h-3" />
                                   </Button>
                                 </>
                               ) : (
                                 <>
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-5 w-5 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                     onClick={() => setEditingRule({ agentId: agent.id, ruleId: rule.id, keyword: rule.keyword, response: rule.response })}
                                   >
                                     <Edit3 className="w-3 h-3" />
                                   </Button>
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-5 w-5 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                     onClick={() => handleDeleteRule(agent.id, rule.id)}
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </Button>
                                 </>
                               )}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                      className="w-full h-8 text-[9px] font-bold uppercase tracking-widest border-slate-200"
                    >
                      {t('configure')}
                    </Button>

                    <AnimatePresence>
                      {selectedAgentId === agent.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-3 pt-2 border-t border-slate-200"
                        >
                           <div className="space-y-2">
                              <Input 
                                placeholder={t('keyword')}
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                className="h-8 text-[10px] uppercase font-bold"
                              />
                              <Input 
                                placeholder={t('response')}
                                value={newResponse}
                                onChange={(e) => setNewResponse(e.target.value)}
                                className="h-8 text-[10px] italic"
                              />
                              <Button 
                                onClick={() => handleAddRule(agent.id)}
                                className="w-full h-8 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest"
                              >
                                {t('addRule')}
                              </Button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 theme-card bg-slate-900 text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Nexus Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Channel ID</label>
                  <Input 
                    placeholder="-100xxxxxxx" 
                    className="h-9 bg-white/10 border-white/20 text-white text-xs font-mono placeholder:text-white/20"
                  />
               </div>
               <p className="text-[9px] text-slate-500 leading-relaxed italic">
                 GLOBAXYS uses secure webhook tunneling to bridge external matrices with our internal synergy protocols.
               </p>
               <Button className="w-full h-9 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-lg">Update Uplink</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
