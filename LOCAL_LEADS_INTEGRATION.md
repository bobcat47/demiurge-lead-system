# Local Leads Finder Integration

## Overview

The `local-leads-finder` repository has been integrated into the Demiurge Lead Matcher as a **Provider Discovery Engine**. This enables automatic discovery of local businesses from Google Maps and other sources.

## What Was Integrated

### From local-leads-finder:
- ✅ Decodo Web Scraping API client (`scraper_api_session.py`)
- ✅ Google Maps provider logic (`google_maps.py`)
- ✅ Business deduplication concepts
- ✅ CSV/JSON export patterns

### Refactored For Demiurge:
- Converted Python/Flask → TypeScript/Next.js
- Integrated with existing database schema
- Added to worker architecture
- Connected to lead matching system

## New Components

### 1. Scraper Client (`apps/worker/src/scrapers/`)
```
scrapers/
├── decodo-client.ts       # API client for Decodo
└── provider-scraper.ts    # Provider discovery logic
```

### 2. API Routes (`apps/web/src/app/api/providers/`)
```
providers/
├── route.ts               # GET /api/providers
└── discover/
    └── route.ts           # POST /api/providers/discover
```

### 3. Database Tables
```sql
providers                    # Extended with external_id, google_maps_url, etc.
provider_sources             # Data source configuration
provider_scrape_jobs         # Discovery job tracking
provider_enrichment_logs     # Data enrichment history
```

### 4. UI Components
```
components/
└── ProviderDiscoveryPanel.tsx   # Discovery interface
```

## How It Works

### Provider Discovery Flow:
```
1. User enters: keyword + city + country
              ↓
2. POST /api/providers/discover
              ↓
3. ProviderScraper.searchProviders()
              ↓
4. DecodoClient.searchGoogleMaps()
              ↓
5. Parse & deduplicate results
              ↓
6. Save to providers table
              ↓
7. Available for lead matching
```

### Lead Matching Integration:
```
Social Post Detected
       ↓
Intent Extraction (plumbing + urgent + Downtown)
       ↓
Provider Matching
       ↓
Query providers table (service + location)
       ↓
Rank by: rating, response time, emergency availability
       ↓
Display matched providers in lead card
```

## Configuration

### Required Environment Variables:
```bash
# Decodo API (formerly ScraperAPI)
DECODO_USERNAME=your_username
DECODO_PASSWORD=your_password
DECODO_RPS=1.0  # Requests per second limit

# Database (existing)
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

### Get Decodo Credentials:
1. Sign up at https://decodo.com (formerly ScraperAPI)
2. Navigate to Dashboard → Scraper tab
3. Copy Username and Password
4. Add to `.env` file

## Usage

### Discover Providers:
```bash
curl -X POST http://localhost:3000/api/providers/discover \
  -H "Content-Type: application/json" \
  -d '{
    "query": "plumber",
    "city": "New York",
    "country": "US",
    "limit": 20
  }'
```

### UI Workflow:
1. Go to **Providers** page
2. Click **Discover Providers**
3. Enter service keyword (e.g., "plumber")
4. Enter city (e.g., "Downtown, NY")
5. Click **Discover**
6. Wait for results (fetched via Decodo API)
7. View discovered providers in database

## Data Sources

### Active (with credentials):
| Source | Status | Method |
|--------|--------|--------|
| Google Maps | ✅ Ready | Decodo API |

### Planned (requires setup):
| Source | Status | Method |
|--------|--------|--------|
| Yelp | ⏳ Pending | Yelp Fusion API |
| Facebook | ⏳ Pending | Facebook Graph API |
| Directories | ⏳ Pending | Crawlee scraping |

## Compliance & Ethics

### Rules Followed:
- ✅ Only public data via official APIs
- ✅ Rate limiting enforced (1 req/sec default)
- ✅ No credential theft or bypassing
- ✅ No private group scraping
- ✅ Sources marked if credentials required

### Data Retention:
- Provider records stored indefinitely
- Scrape logs kept for 90 days
- Raw API responses logged for debugging

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMIURGE LEAD MATCHER                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │   Dashboard │────▶│   API       │────▶│   Worker    │   │
│  │   (Next.js) │     │   (Routes)  │     │   (Node)    │   │
│  └─────────────┘     └─────────────┘     └──────┬──────┘   │
│        │                                          │          │
│        │          Provider Discovery Panel        │          │
│        │                                          ▼          │
│        │                              ┌──────────────────┐  │
│        │                              │  DecodoClient    │  │
│        │                              │  (from local-    │  │
│        │                              │   leads-finder)  │  │
│        │                              └────────┬─────────┘  │
│        │                                       │             │
│        └───────────────────────────────────────┼─────────────┤
│                                                ▼             │
│                              ┌──────────────────────────┐   │
│                              │   Decodo API             │   │
│                              │   (Google Maps, etc)     │   │
│                              └──────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Migration

Apply the database migration:
```bash
psql -h localhost -U demiurge -d demiurge \
  -f packages/database/migrations/002_add_provider_discovery.sql
```

## Testing

### Test Provider Discovery:
```bash
# Start the dashboard
cd apps/web && npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/providers/discover \
  -H "Content-Type: application/json" \
  -d '{"query":"plumber","city":"Downtown","limit":5}'
```

### Verify Integration:
1. Check providers appear in database
2. Verify lead matching finds discovered providers
3. Test outreach template generation

## Future Enhancements

1. **Background Jobs**: Queue discovery jobs with BullMQ
2. **Scheduled Refresh**: Auto-update provider data weekly
3. **Enrichment**: Fill missing emails/phones via external APIs
4. **Duplicate Detection**: Advanced matching across sources
5. **More Sources**: Yelp, Facebook, industry directories

## Summary

The `local-leads-finder` has been successfully integrated as a core module within Demiurge Lead Matcher. It provides:

- **Automated provider discovery** from Google Maps
- **Seamless integration** with existing lead matching
- **Compliance-safe** data collection
- **Extensible architecture** for additional sources

The system now supports the complete workflow:
1. Discover providers via API or UI
2. Match providers to detected leads
3. Generate outreach templates
4. Track conversions

All while maintaining the premium UI/UX standards of the Demiurge design system.
