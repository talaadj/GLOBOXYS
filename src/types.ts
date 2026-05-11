export interface CompanyProfile {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  hq: string;
  sector: string;
  size: string;
  email: string;
  website: string;
  jurisdictions: string[];
  capabilities: string[];
  isVerified: boolean;
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  country: string;
  description: string;
  logo: string;
  type: 'Supplier' | 'Partner' | 'Client' | 'Contractor';
  isVerified: boolean;
}

export interface Post {
  id: string;
  companyId: string;
  companyName: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salary: string;
  type: string;
}

export interface AdvisoryTicket {
  id: string;
  query: string;
  response: string;
  category: 'Legal' | 'Economic' | 'Regulatory' | 'Customs';
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export type Language = 'en' | 'ru' | 'es' | 'zh' | 'hi' | 'fr';
