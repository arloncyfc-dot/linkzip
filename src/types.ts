export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  userId: string;
  title?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  limits: {
    urls: number;
    clicks: number;
    customAlias: boolean;
    analytics: boolean;
    api: boolean;
  };
  popular?: boolean;
}
