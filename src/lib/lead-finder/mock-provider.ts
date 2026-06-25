import { Lead, LeadSearchParams, LeadSearchResult, AIAnalysis } from './types';

// Mock data store - simulates a database
let mockLeads: Lead[] = [];
let searchCounter = 0;

const businessTypes = {
  plumber: ['Emergency Plumbing', 'Drain Cleaning', 'Pipe Repair', 'Water Heater Services'],
  electrician: ['Electrical Repair', 'Wiring Installation', 'Circuit Breaker', 'Lighting Installation'],
  dentist: ['General Dentistry', 'Cosmetic Dentistry', 'Orthodontics', 'Emergency Dental'],
  barber: ['Men\'s Haircuts', 'Beard Trimming', 'Hot Towel Shave', 'Hair Styling'],
  pharmacy: ['Prescription Services', 'Health Consultation', 'Vaccinations', 'Health Products'],
  restaurant: ['Fine Dining', 'Casual Dining', 'Fast Food', 'Catering Services'],
  accountant: ['Tax Preparation', 'Bookkeeping', 'Financial Planning', 'Business Consulting'],
  roofer: ['Roof Repair', 'Roof Installation', 'Gutter Services', 'Emergency Roofing'],
  estate_agent: ['Property Sales', 'Property Lettings', 'Valuations', 'Property Management'],
};

const locations = {
  'London': ['Central London', 'Westminster', 'Camden', 'Kensington', 'Chelsea'],
  'Manchester': ['City Centre', 'Salford', 'Didsbury', 'Chorlton'],
  'Birmingham': ['City Centre', 'Edgbaston', 'Solihull', 'Sutton Coldfield'],
  'Westminster': ['Victoria', 'Pimlico', 'St James\'s', 'Millbank'],
  'Camden': ['Camden Town', 'Kentish Town', 'Belsize Park', 'Hampstead'],
};

const streetNames = [
  'High Street', 'Church Road', 'Station Road', 'London Road', 'Victoria Street',
  'Queen\'s Road', 'King Street', 'Park Avenue', 'The Avenue', 'Mill Lane',
  'Bridge Street', 'Main Street', 'Broadway', 'Maple Avenue', 'Oak Street'
];

function generateId(): string {
  return `LD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function generatePhone(): string {
  const area = ['020', '0161', '0121', '077', '078', '079'][Math.floor(Math.random() * 6)];
  const num = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `${area} ${num.slice(0, 4)} ${num.slice(4)}`;
}

function generateEmail(businessName: string): string {
  const domain = ['gmail.com', 'yahoo.com', 'outlook.com', 'business.co.uk', 'services.com'][Math.floor(Math.random() * 5)];
  const clean = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `contact@${clean}.${domain}`;
}

function generateWebsite(businessName: string): string {
  const clean = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://www.${clean}.co.uk`;
}

function generateRating(): number {
  return parseFloat((Math.random() * 2 + 3).toFixed(1)); // 3.0 to 5.0
}

function generateReviewCount(): number {
  return Math.floor(Math.random() * 500) + 10;
}

function generateAddress(location: string): string {
  const num = Math.floor(Math.random() * 200) + 1;
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  const postcode = `${location.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
  return `${num} ${street}, ${location}, ${postcode}`;
}

function generateOpeningHours(): Record<string, string> {
  return {
    'Monday': '08:00 - 18:00',
    'Tuesday': '08:00 - 18:00',
    'Wednesday': '08:00 - 18:00',
    'Thursday': '08:00 - 18:00',
    'Friday': '08:00 - 18:00',
    'Saturday': '09:00 - 17:00',
    'Sunday': 'Closed',
  };
}

function generateServices(businessType: string): string[] {
  const services = businessTypes[businessType as keyof typeof businessTypes] || ['General Services'];
  const count = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...services].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 50; // Base score
  
  if (lead.rating && lead.rating >= 4.0) score += 15;
  if (lead.rating && lead.rating >= 4.5) score += 10;
  if (lead.reviewCount && lead.reviewCount > 50) score += 10;
  if (lead.website) score += 10;
  if (lead.phone) score += 5;
  if (lead.email) score += 5;
  
  return Math.min(score, 100);
}

const businessNamePrefixes = ['Premier', 'Elite', 'City', 'Metro', 'Royal', 'Express', 'Prime', 'Advanced', 'Pro', 'Swift'];
const businessNameSuffixes = ['Services', 'Solutions', 'Experts', 'Specialists', 'Group', 'Ltd', 'Co', 'Partners'];

function generateBusinessName(businessType: string): string {
  const prefix = businessNamePrefixes[Math.floor(Math.random() * businessNamePrefixes.length)];
  const suffix = businessNameSuffixes[Math.floor(Math.random() * businessNameSuffixes.length)];
  const typeCapitalized = businessType.charAt(0).toUpperCase() + businessType.slice(1);
  
  const patterns = [
    `${prefix} ${typeCapitalized}`,
    `${typeCapitalized} ${suffix}`,
    `${prefix} ${typeCapitalized} ${suffix}`,
    `The ${typeCapitalized} Co.`,
    `${typeCapitalized} Direct`,
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

export async function searchLeads(params: LeadSearchParams): Promise<LeadSearchResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  searchCounter++;
  const searchId = `SEARCH-${searchCounter}`;
  
  const limit = params.limit || 20;
  const leads: Lead[] = [];
  
  for (let i = 0; i < limit; i++) {
    const businessType = params.businessType.toLowerCase();
    const location = params.location;
    
    const lead: Lead = {
      id: generateId(),
      businessName: generateBusinessName(businessType),
      businessType: businessType,
      category: businessType.charAt(0).toUpperCase() + businessType.slice(1),
      address: generateAddress(location),
      location: location,
      phone: Math.random() > 0.1 ? generatePhone() : undefined,
      website: Math.random() > 0.2 ? generateWebsite(generateBusinessName(businessType)) : undefined,
      email: Math.random() > 0.3 ? generateEmail(generateBusinessName(businessType)) : undefined,
      rating: Math.random() > 0.1 ? generateRating() : undefined,
      reviewCount: Math.random() > 0.1 ? generateReviewCount() : undefined,
      source: ['Google Maps', 'Yelp', 'Yellow Pages', 'Bing Places'][Math.floor(Math.random() * 4)],
      leadScore: 0,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      openingHours: Math.random() > 0.3 ? generateOpeningHours() : undefined,
      socialLinks: Math.random() > 0.5 ? {
        facebook: Math.random() > 0.3 ? `https://facebook.com/${businessType}${i}` : undefined,
        instagram: Math.random() > 0.5 ? `https://instagram.com/${businessType}${i}` : undefined,
      } : undefined,
      services: generateServices(businessType),
    };
    
    lead.leadScore = calculateLeadScore(lead);
    leads.push(lead);
  }
  
  // Store in mock database
  mockLeads = [...mockLeads, ...leads];
  
  return {
    leads,
    total: leads.length,
    query: params,
    searchId,
  };
}

export async function getLeadById(id: string): Promise<Lead | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockLeads.find(lead => lead.id === id) || null;
}

export async function saveLead(lead: Lead): Promise<Lead> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const existingIndex = mockLeads.findIndex(l => l.id === lead.id);
  if (existingIndex >= 0) {
    mockLeads[existingIndex] = { ...lead, updatedAt: new Date().toISOString() };
    return mockLeads[existingIndex];
  } else {
    const newLead = { ...lead, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockLeads.push(newLead);
    return newLead;
  }
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const lead = mockLeads.find(l => l.id === id);
  if (lead) {
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    return lead;
  }
  return null;
}

export async function generateAIAnalysis(lead: Lead): Promise<AIAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const businessType = lead.businessType;
  const businessName = lead.businessName;
  const hasWebsite = !!lead.website;
  const rating = lead.rating || 0;
  
  const analysis: AIAnalysis = {
    generatedAt: new Date().toISOString(),
    
    businessSummary: `${businessName} is a ${businessType} service operating in ${lead.location}. ${hasWebsite ? 'They have an established online presence' : 'They lack a significant online presence'} with a ${rating > 0 ? `${rating}-star rating` : 'limited review profile'}.`,
    
    whyGoodLead: `This ${businessType} represents a high-value opportunity due to ${rating >= 4.0 ? 'strong customer satisfaction metrics' : 'untapped potential for reputation management'} and ${lead.reviewCount && lead.reviewCount > 50 ? 'significant market visibility' : 'room for growth in local search'}.`,
    
    problemsOpportunities: [
      !hasWebsite && 'No professional website - opportunity for web development package',
      rating < 4.0 && 'Mixed reviews indicate reputation management opportunity',
      !lead.email && 'Limited digital contact methods',
      lead.reviewCount && lead.reviewCount < 20 && 'Low review count - needs review generation strategy',
      'Competitors likely investing in digital marketing',
      'Potential for automated appointment booking system',
    ].filter(Boolean) as string[],
    
    recommendedPackage: hasWebsite 
      ? 'Growth Package: SEO optimization, review management, and social media automation'
      : 'Foundation Package: Professional website, Google Business optimization, and lead capture system',
    
    personalizedProposal: `Dear ${businessName} Team,

I've been researching top ${businessType} services in ${lead.location} and was impressed by your ${rating > 0 ? `reputation` : 'established presence'}. However, I noticed ${!hasWebsite ? 'your business could benefit from a professional website to capture more leads' : 'opportunities to enhance your digital presence and attract more customers'}.

Demiurge Systems specializes in helping ${businessType}s like yours:
- Increase qualified leads by 40-60%
- Automate customer acquisition
- Improve online reputation
- Reduce marketing costs

I'd love to show you how our ${hasWebsite ? 'Growth' : 'Foundation'} Package can help ${businessName} dominate the ${lead.location} market.

Would you be open to a 15-minute call this week?`,
    
    vapiCallPrompt: `You are an AI sales assistant calling on behalf of Demiurge Systems. You are calling ${businessName}, a ${businessType} in ${lead.location}.

Your goal: Book a 15-minute discovery call with the owner or manager.

Key points to mention:
- You've researched their business and are impressed by their ${rating > 0 ? `${rating}-star reputation` : 'local presence'}
- You specialize in helping ${businessType}s get more customers
- You have specific insights about their market in ${lead.location}
- No obligation, just a quick conversation

Be professional, concise, and respectful of their time. If they're not interested, politely thank them and end the call. If they have questions, answer briefly and steer toward booking the call.`,
    
    openingCallScript: `"Hi, this is [Your Name] from Demiurge Systems. I'm calling because I've been researching ${businessType} services in ${lead.location}, and ${businessName} caught my attention ${rating > 0 ? `with your excellent reviews` : `as an established local business`}.

I work with ${businessType}s to help them get more qualified leads and customers through digital marketing automation. I noticed ${!hasWebsite ? `you don't currently have a website` : `some opportunities to improve your online presence`}, and I believe we could help you significantly increase your customer base.

Would you have 15 minutes this week for a quick call to explore if we'd be a good fit? I'd love to share some specific insights about your market."`,
    
    objectionHandling: [
      'OBJECTION: "We\'re too busy right now" → RESPONSE: "I completely understand. That\'s actually why many of our clients come to us - they need more qualified leads without more manual work. Our system runs automatically. Would a quick 10-minute call next week work?"',
      'OBJECTION: "We already have a website/marketing" → RESPONSE: "That\'s great! Many of our best clients had existing marketing. We specialize in enhancing what\'s working and filling the gaps. Could I show you a quick audit of your current setup?"',
      'OBJECTION: "How much does it cost?" → RESPONSE: "Our packages start at £500/month, but I\'d need to understand your specific needs to give you an accurate quote. That\'s why I suggest a quick discovery call - no obligation."',
      'OBJECTION: "Send me an email" → RESPONSE: "Absolutely, I can do that. But I find that a quick 10-minute conversation helps me understand your specific situation so I can send relevant information. Would Tuesday or Wednesday work better?"',
    ],
    
    followUpMessage: `Hi ${businessName} team,

Following up on my call earlier. As promised, here are 3 quick insights about ${businessType}s in ${lead.location}:

1. Top competitors are investing heavily in Google Ads (avg £800/month)
2. 73% of customers check online reviews before calling
3. Businesses with automated booking see 35% more appointments

I'd love to show you how we can help ${businessName} capture this opportunity.

Book a 15-min call: [CALENDAR_LINK]

Best regards,
[Your Name]
Demiurge Systems`,
    
    internalNotes: `Priority: ${lead.leadScore >= 80 ? 'HIGH' : lead.leadScore >= 60 ? 'MEDIUM' : 'LOW'}\n` +
      `Estimated Deal Size: £${lead.leadScore >= 80 ? '2,000-5,000' : '1,000-2,000'}/month\n` +
      `Best Contact Time: Weekday mornings\n` +
      `Decision Maker: Likely owner/manager\n` +
      `Key Pain Points: ${!hasWebsite ? 'No website, ' : ''}${rating < 4.0 ? 'Reputation issues, ' : ''}Limited digital presence\n` +
      `Recommended Approach: ${hasWebsite ? 'Growth-focused, emphasize ROI' : 'Education-focused, establish need'}`,
    
    painPoints: [
      'Spending too much time on manual lead follow-up',
      'Missing calls while working on jobs',
      'Competitors showing up higher on Google',
      'Relying on word-of-mouth for new business',
      'No system for capturing website visitors',
    ],
    
    websiteQualityScore: hasWebsite ? Math.floor(Math.random() * 30) + 50 : 0,
    seoVisibilityEstimate: lead.reviewCount && lead.reviewCount > 100 ? 'medium' : 'low',
    
    weaknesses: [
      !hasWebsite && 'No professional website',
      rating < 4.0 && 'Below-average customer satisfaction',
      !lead.email && 'Limited digital contact options',
      lead.reviewCount && lead.reviewCount < 30 && 'Low social proof',
      'Likely not using marketing automation',
    ].filter(Boolean) as string[],
  };
  
  // Save analysis to lead
  const leadIndex = mockLeads.findIndex(l => l.id === lead.id);
  if (leadIndex >= 0) {
    mockLeads[leadIndex].aiAnalysis = analysis;
    mockLeads[leadIndex].status = 'proposal_generated';
    mockLeads[leadIndex].updatedAt = new Date().toISOString();
  }
  
  return analysis;
}

export async function sendToVapi(leadId: string, config?: { phoneNumber?: string }): Promise<{ success: boolean; message: string; callId?: string }> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, this would call the Vapi API
  // For now, we simulate a successful queue
  
  const lead = mockLeads.find(l => l.id === leadId);
  if (!lead) {
    return { success: false, message: 'Lead not found' };
  }
  
  if (!lead.phone) {
    return { success: false, message: 'Lead has no phone number' };
  }
  
  const callId = `VAPI-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  return {
    success: true,
    message: `Vapi call queued for ${lead.businessName}. Call ID: ${callId}`,
    callId,
  };
}

// Get all saved leads
export async function getAllLeads(): Promise<Lead[]> {
  return [...mockLeads];
}
