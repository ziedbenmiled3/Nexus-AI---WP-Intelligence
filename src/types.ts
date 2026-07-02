export interface WPConfig {
  id?: string;
  url: string;
  username: string;
  applicationPassword: string;
  consumerKey?: string;
  consumerSecret?: string;
  geminiApiKey?: string;
  currency?: string;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPAuditResult {
  score: number;
  seoSuggestions: string[];
  contentImprovements: string[];
  overallHealth: string;
  optimizedTitle?: string;
}

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  status: string;
  type: string;
  link: string;
  featured_media: number;
}

export interface WPProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  permalink?: string;
  link?: string;
  images: { id: number; src: string; name: string }[];
  categories: { id: number; name: string; slug: string }[];
}

export interface CompetitorData {
  url: string;
  keywords: string[];
  strengths: string[];
  visibilityScores: {
    google: number;
    bing: number;
    others: number;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items_count: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  total_spend: number;
  orders_count: number;
  last_order: string;
  status: 'active' | 'inactive';
}

export interface SupportTicket {
  id?: string;
  user_email: string;
  subject: string;
  description: string;
  category: 'bug' | 'suggestion' | 'connection' | 'other';
  status: 'new' | 'processing' | 'resolved';
  active_tab: string;
  site_url?: string;
  browser_info?: string;
  created_at: string;
  admin_reply?: string;
  updated_at?: string;
}
