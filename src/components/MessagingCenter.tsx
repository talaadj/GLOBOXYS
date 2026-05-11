import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Conversation, Message } from '../types';
import { useTranslation } from '../i18n';

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', participantId: 'c1', participantName: 'Atlas Manufacturing', lastMessage: 'The shipment is on its way to the Hamburg node.', timestamp: '10:45 AM', unreadCount: 2 },
  { id: '2', participantId: 'c2', participantName: 'Lumina Legal', lastMessage: 'Contract review complete. Awaiting signature.', timestamp: 'Yesterday', unreadCount: 0 },
  { id: '3', participantId: 'c3', participantName: 'Solaris Infra', lastMessage: 'Interested in offshore cable logistics collab.', timestamp: 'Oct 28', unreadCount: 0 },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: 'c1', recipientId: 'me', content: 'Hello, regarding the Q4 supply chain...', timestamp: '10:00 AM', read: true },
    { id: 'm2', senderId: 'me', recipientId: 'c1', content: 'We are ready to deploy the units.', timestamp: '10:15 AM', read: true },
    { id: 'm3', senderId: 'c1', recipientId: 'me', content: 'The shipment is on its way to the Hamburg node.', timestamp: '10:45 AM', read: false },
  ]
};

interface MessagingCenterProps {
  initialSelectedId?: string | null;
  onSelectConversation?: (id: string | null) => void;
}

export default function MessagingCenter({ initialSelectedId, onSelectConversation }: MessagingCenterProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [newMessage, setNewMessage] = useState('');

  const handleSelect = (id: string | null) => {
    setSelectedId(id);
    if (onSelectConversation) onSelectConversation(id);
  };

  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedId);
  const messages = selectedId ? MOCK_MESSAGES[selectedId] || [] : [];

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Sidebar */}
      <Card className={`w-full md:w-80 border-slate-100 shadow-xl overflow-hidden flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9 bg-white border-slate-200 text-xs font-bold uppercase tracking-widest" placeholder={t('searchComms')} />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {MOCK_CONVERSATIONS.map(conv => (
            <div 
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={`p-4 cursor-pointer transition-colors border-l-2 ${selectedId === conv.id ? 'bg-blue-50 border-blue-600' : 'border-transparent hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 text-sm">{conv.participantName}</h4>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{conv.timestamp}</span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 italic font-light">"{conv.lastMessage}"</p>
              {conv.unreadCount > 0 && (
                <div className="mt-2 flex">
                  <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    {conv.unreadCount} {t('newUpdates')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className={`flex-1 border-slate-100 shadow-xl flex flex-col overflow-hidden relative ${!selectedId ? 'hidden md:flex items-center justify-center bg-slate-50' : 'flex bg-white'}`}>
        <AnimatePresence mode="wait">
          {selectedId ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full w-full"
            >
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => handleSelect(null)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-white font-black text-xs">
                    {selectedConversation?.participantName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 text-sm">{selectedConversation?.participantName}</h3>
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t('encryptedLink')}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-8 bg-slate-50/30">
                <div className="space-y-6">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        msg.senderId === 'me' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`mt-2 text-[9px] font-bold uppercase tracking-widest ${msg.senderId === 'me' ? 'text-slate-400' : 'text-slate-300'}`}>
                          {msg.timestamp} • {t('synced')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex gap-3">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('handshakeInitiate')} 
                    className="h-12 bg-slate-50 border-none px-6 text-xs font-bold uppercase tracking-widest focus-visible:ring-slate-900"
                    onKeyDown={(e) => e.key === 'Enter' && setNewMessage('')}
                  />
                  <Button className="h-12 w-12 bg-slate-900 hover:bg-slate-800 shrink-0" onClick={() => setNewMessage('')}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12"
            >
              <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-slate-950 font-black uppercase tracking-[0.2em] text-xs">{t('noActiveUplink')}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">{t('handshakePrompt')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
