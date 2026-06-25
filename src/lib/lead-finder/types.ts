export interface Lead {
  id: string;
  businessName: string;
  businessType: string;
  category: string;
  address: string;
  location: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  source: string;
  leadScore: number;
  status: 'new' | 'reviewed' | 'proposal_generated' | 'contacted' | 'saved';
  createdAt: string;
  updatedAt: string;
  
  // Extended intelligence
  openingHours?: Record<string, string>;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  services?: string[];
  photos?: string[];
  
  // AI Generated content
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  generatedAt: string;
  businessSummary: string;
  whyGoodLead: string;
  problemsOpportunities: string[];
  recommendedPackage: string;
  personalizedProposal: string;
  vapiCallPrompt: string;
  openingCallScript: string;
  objectionHandling: string[];
  followUpMessage: string;
  internalNotes: string;
  painPoints: string[];
  websiteQualityScore?: number;
  seoVisibilityEstimate?: 'low' | 'medium' | 'high';
  weaknesses?: string[];
}

export interface LeadSearchParams {
  businessType: string;
  location: string;
  radius?: number;
  limit?: number;
}

export interface LeadSearchResult {
  leads: Lead[];
  total: number;
  query: LeadSearchParams;
  searchId: string;
}

export interface VapiConfig {
  apiKey?: string;
  assistantId?: string;
  phoneNumber?: string;
}
