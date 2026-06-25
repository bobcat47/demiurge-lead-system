/**
 * Demiurge Lead Matcher - Web Server
 * Express server for mobile-friendly lead matching UI
 */

const express = require('express');
const path = require('path');
const matcher = require('./scripts/matcher');

const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load businesses on startup
let businesses;
try {
  businesses = matcher.loadBusinesses('./businesses.json');
  console.log(`✓ Loaded ${businesses.length} businesses`);
} catch (err) {
  console.error('Failed to load businesses:', err.message);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    businesses: businesses.length,
    timestamp: new Date().toISOString()
  });
});

// Match endpoint - POST text and get matches
app.post('/api/match', (req, res) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Please provide text to analyze',
      example: { text: 'Looking for a plumber in Downtown area urgently!' }
    });
  }
  
  try {
    const result = matcher.matchPostToBusinesses(text.trim(), businesses);
    
    // Return simplified response for UI
    res.json({
      success: true,
      intent: {
        service: result.intent.service,
        serviceConfidence: result.intent.serviceConfidence,
        urgency: result.intent.urgency,
        budget: result.intent.budget,
        locations: result.intent.locations,
        postcodes: result.intent.postcodes
      },
      matches: result.matches.slice(0, 5).map(m => ({
        id: m.business.id,
        name: m.business.name,
        score: m.score,
        rating: m.business.rating,
        responseTime: m.business.responseTime,
        emergencyService: m.business.emergencyService,
        pricingTier: m.business.pricingTier,
        reasons: m.reasons,
        contacts: m.business.contacts,
        templates: m.templates
      })),
      totalMatches: result.matches.length
    });
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ error: 'Failed to process match', message: err.message });
  }
});

// Get all businesses (for reference)
app.get('/api/businesses', (req, res) => {
  res.json(businesses.map(b => ({
    id: b.id,
    name: b.name,
    services: b.services,
    areas: b.areas,
    rating: b.rating
  })));
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║   Demiurge Lead Matcher Server         ║`);
  console.log(`╠════════════════════════════════════════╣`);
  console.log(`║  URL: http://localhost:${PORT}            ║`);
  console.log(`║  Businesses: ${businesses.length} loaded                ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

module.exports = app;
