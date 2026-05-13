import { Post, Company, Job, AdvisoryTicket } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    companyId: 'c1',
    companyName: 'EcoStream Tech',
    content: 'Seeking Tier-1 high-precision manufacturing partners for Indonesia market entry. Must satisfy Directive 2024 compliance frameworks.',
    timestamp: '2h ago',
    likes: 124,
    comments: 18,
    tags: ['MARKET_ENTRY', 'COMPLIANCE'],
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop'
    },
    rating: 4.8,
    reactions: { '🚀': 12, '💡': 5, '✅': 8 }
  },
  {
    id: 'p2',
    companyId: 'c2',
    companyName: 'Lumina Legal',
    content: 'Peringatan operasional: Peraturan bea cukai Indonesia diperbarui pada Q3. Pemetaan titik gesekan logistik untuk node APAC.',
    timestamp: '5h ago',
    likes: 89,
    comments: 42,
    tags: ['JURISDICTION', 'APAC'],
    rating: 4.5
  },
  {
    id: 'p3',
    companyId: 'c3',
    companyName: 'Solaris Infra',
    content: 'Wir suchen Partner für den Bau von Offshore-Windparks in der Nordsee. Fokus auf Kabellogistik und Netzanschluss.',
    timestamp: '8h ago',
    likes: 56,
    comments: 12,
    tags: ['ENERGY', 'EMEA'],
    media: {
      type: 'video',
      url: 'https://cdn.pixabay.com/video/2019/12/17/30303-380757235_large.mp4'
    },
    rating: 4.9,
    reactions: { '🌊': 15, '⚡': 10 }
  }
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: 'Atlas Manufacturing',
    sector: 'Industrial Electronics',
    country: 'Germany',
    description: 'Hochpräzise Leiterplattenbestückung und industrielle Robotikkomponenten. Zertifiziert für Luft- und Raumfahrt sowie Verteidigung.',
    logo: '',
    type: 'Supplier',
    isVerified: true
  },
  {
    id: 'c2',
    name: 'Swift-Logix Solutions',
    sector: 'Supply Chain',
    country: 'Singapore',
    description: 'Specialized in cold-chain logistics and real-time inventory tracking for pharmaceutical industries.',
    logo: '',
    type: 'Contractor',
    isVerified: true
  },
  {
    id: 'c3',
    name: 'BlueWave Energy',
    sector: 'Renewables',
    country: 'Norway',
    description: 'Offshore wind farm developer looking for transmission cable partners and local maintenance contractors.',
    logo: '',
    type: 'Partner',
    isVerified: false
  }
];

export const MOCK_JOBS: Job[] = [
  { id: 'j1', title: 'VP of Trade Operations', companyName: 'OmniCorp', location: 'London/Remote', salary: '$180k - $220k', type: 'Full-time' },
  { id: 'j2', title: 'Senior Customs Compliance Officer', companyName: 'Swift-Logix', location: 'Singapore', salary: '$120k - $150k', type: 'Full-time' },
  { id: 'j3', title: 'Director of Strategic Partnerships', companyName: 'EcoStream', location: 'New York', salary: '$200k+', type: 'Full-time' },
  { id: 'j4', title: 'International Tax Consultant', companyName: 'Lumina Legal', location: 'Remote', salary: 'Consulting', type: 'Contract' },
];

// For Advisory Hub, we would usually have archived tickets or generic topics
export const MOCK_ADVISORY_TOPICS = [
  { id: 't1', title: 'Tax Harmonization', category: 'Legal', content: 'Cross-border tax implications for digital service nodes.' },
  { id: 't2', title: 'Trade Tariffs Q3', category: 'Economic', content: 'Updated tariff schedules for mechanical exports to Brazil.' },
  { id: 't3', title: 'Sanction Screening', category: 'Regulatory', content: 'Protocol for real-time screening against global restricted party lists.' },
  { id: 't4', title: 'Customs Node Hamburg', category: 'Customs', content: 'Special economic zone clearance procedures for hazardous materials.' }
];
