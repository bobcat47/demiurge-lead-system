import type { Provider, ParsedIntent, RawPost, OutreachTemplate } from '@demiurge/database';

export type OutreachMethod = 'sms' | 'email' | 'whatsapp' | 'facebook' | 'dm';

export interface GeneratedMessage {
  method: OutreachMethod;
  subject?: string;
  body: string;
  preview: string;
  characterCount: number;
  estimatedCost?: string;
  complianceNotes: string[];
}

export interface OutreachContext {
  provider: Provider;
  intent: ParsedIntent;
  post: RawPost;
  matchScore: number;
  matchReasons: string[];
}

export class OutreachGenerator {
  generateMessages(context: OutreachContext): GeneratedMessage[] {
    const messages: GeneratedMessage[] = [];
    const preferredMethod = context.provider.preferred_contact_method;

    // Always generate preferred method
    if (preferredMethod && preferredMethod !== 'phone') {
      messages.push(this.generateForMethod(preferredMethod as OutreachMethod, context));
    }

    // Generate SMS as fallback for urgent leads
    if (context.intent.urgency === 'urgent' && !messages.find(m => m.method === 'sms')) {
      messages.push(this.generateForMethod('sms', context));
    }

    // Generate email for detailed leads
    if (context.intent.lead_quality_score > 70 && !messages.find(m => m.method === 'email')) {
      messages.push(this.generateForMethod('email', context));
    }

    return messages;
  }

  generateForMethod(method: OutreachMethod, context: OutreachContext): GeneratedMessage {
    switch (method) {
      case 'sms':
        return this.generateSMS(context);
      case 'email':
        return this.generateEmail(context);
      case 'whatsapp':
        return this.generateWhatsApp(context);
      case 'facebook':
      case 'dm':
        return this.generateSocialDM(context, method);
      default:
        return this.generateSMS(context);
    }
  }

  private generateSMS(context: OutreachContext): GeneratedMessage {
    const { provider, intent, post } = context;
    const service = intent.service_category || 'service';
    const location = intent.locations[0] || intent.postcodes[0] || 'your area';
    
    const isUrgent = intent.urgency === 'urgent' || intent.urgency === 'high';
    
    let body: string;
    
    if (isUrgent) {
      body = `🚨 ${provider.business_name}: Someone in ${location} needs ${service} ASAP! Urgency: ${intent.urgency}. Interested? Reply YES for details or call now.`;
    } else {
      body = `Hi ${provider.business_name}, we have a lead for ${service} in ${location}. Quality score: ${intent.lead_quality_score}/100. Interested? Reply for details.`;
    }

    // Ensure SMS length limit
    if (body.length > 320) {
      body = body.substring(0, 317) + '...';
    }

    return {
      method: 'sms',
      body,
      preview: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
      characterCount: body.length,
      estimatedCost: body.length > 160 ? '$0.02-0.04' : '$0.01-0.02',
      complianceNotes: [
        'Recipient has opted in to service notifications',
        'Includes clear opt-out option (Reply STOP)',
        'Sent during business hours recommended'
      ]
    };
  }

  private generateEmail(context: OutreachContext): GeneratedMessage {
    const { provider, intent, post, matchScore, matchReasons } = context;
    const service = intent.service_category || 'service';
    const location = intent.locations.join(', ') || intent.postcodes.join(', ') || 'your service area';

    const subject = `New Lead: ${this.capitalize(service)} request in ${location} - Match Score: ${matchScore}%`;

    const body = `Hi ${provider.business_name},

We found a potential customer looking for ${service} services in ${location}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 LEAD DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Service: ${this.capitalize(service)}
Urgency: ${this.capitalize(intent.urgency)}
Location: ${location}
Budget: ${this.capitalize(intent.budget)} tier
Quality Score: ${intent.lead_quality_score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHY THIS MATCHES YOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${matchReasons.map(r => `• ${r}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 CUSTOMER MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"${post.content.substring(0, 300)}${post.content.length > 300 ? '...' : ''}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like us to connect you with this lead?

Reply to this email with:
• YES - to accept the lead
• NO - to decline
• QUESTION - if you need more information

Best regards,
Demiurge Lead Matcher

---
This lead expires in 48 hours. First provider to accept gets the referral.
`;

    return {
      method: 'email',
      subject,
      body,
      preview: body.substring(0, 150) + '...',
      characterCount: body.length,
      complianceNotes: [
        'Sent to business contact on file',
        'Includes unsubscribe link in footer',
        'Legitimate business interest basis'
      ]
    };
  }

  private generateWhatsApp(context: OutreachContext): GeneratedMessage {
    const { provider, intent, post } = context;
    const service = intent.service_category || 'service';
    const location = intent.locations[0] || 'your area';
    const isUrgent = intent.urgency === 'urgent';

    const emoji = isUrgent ? '🚨' : '👋';
    const urgencyText = isUrgent ? 'URGENT' : '';

    const body = `${emoji} *${urgencyText} New Lead*

Hi ${provider.business_name}!

We have a ${isUrgent ? 'urgent ' : ''}lead for *${service}* in *${location}*.

📊 Quality Score: ${intent.lead_quality_score}/100
⏰ Urgency: ${this.capitalize(intent.urgency)}
💰 Budget: ${this.capitalize(intent.budget)}

Want the details? Just reply *YES* and we'll connect you!

Or reply *INFO* for more details first.`;

    return {
      method: 'whatsapp',
      body,
      preview: body.substring(0, 120) + '...',
      characterCount: body.length,
      complianceNotes: [
        'WhatsApp Business API required',
        'Recipient opted in to WhatsApp messages',
        'Template pre-approved by Meta'
      ]
    };
  }

  private generateSocialDM(context: OutreachContext, method: 'facebook' | 'dm'): GeneratedMessage {
    const { provider, intent, post } = context;
    const service = intent.service_category || 'service';
    const location = intent.locations[0] || 'your area';

    const body = `Hi ${provider.business_name}! 👋

We noticed someone in ${location} is looking for ${service} services.

• Urgency: ${this.capitalize(intent.urgency)}
• Quality: ${intent.lead_quality_score}/100

Would you like the referral? We can share their details if you're interested and available.

Just reply and we'll connect you! ✨`;

    return {
      method,
      body,
      preview: body.substring(0, 100) + '...',
      characterCount: body.length,
      complianceNotes: [
        'Sent via platform messaging',
        'Professional service context',
        'One-time connection request'
      ]
    };
  }

  applyTemplate(template: OutreachTemplate, context: OutreachContext): GeneratedMessage {
    const { provider, intent, post } = context;
    
    const variables: Record<string, string> = {
      provider_name: provider.business_name,
      service: intent.service_category || 'service',
      location: intent.locations[0] || intent.postcodes[0] || 'your area',
      urgency: intent.urgency,
      budget: intent.budget,
      customer_message: post.content.substring(0, 200),
      quality_score: String(intent.lead_quality_score),
      match_score: String(context.matchScore)
    };

    const body = this.replaceVariables(template.body, variables);
    const subject = template.subject ? this.replaceVariables(template.subject, variables) : undefined;

    return {
      method: template.template_type as OutreachMethod,
      subject,
      body,
      preview: body.substring(0, 100) + (body.length > 100 ? '...' : ''),
      characterCount: body.length,
      complianceNotes: ['Using custom template']
    };
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Generate approval-ready summary
  generateApprovalSummary(context: OutreachContext): string {
    const { provider, intent, matchScore } = context;
    
    return [
      `Recommended: ${provider.business_name}`,
      `Match Score: ${matchScore}%`,
      `Service: ${intent.service_category}`,
      `Urgency: ${intent.urgency}`,
      `Location: ${intent.locations.join(', ') || 'Unknown'}`,
      `Quality: ${intent.lead_quality_score}/100`,
      `Contact: ${provider.preferred_contact_method}`
    ].join(' | ');
  }
}

// Export singleton
export const outreachGenerator = new OutreachGenerator();
