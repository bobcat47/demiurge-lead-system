# Demiurge Lead Matcher - Quick Start Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEMIURGE LEAD MATCHER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐ │
│   │ SOURCES  │────▶│ CRAWLER  │────▶│  INTENT  │────▶│ MATCH  │ │
│   │          │     │ (Crawlee)│     │ DETECTOR │     │ENGINE  │ │
│   └──────────┘     └──────────┘     └──────────┘     └───┬────┘ │
│                                                          │       │
│   ┌──────────────────────────────────────────────────────┼─────┐│
│   │                   DASHBOARD (Next.js)                 │     ││
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │     ││
│   │  │Sources │ │ Leads  │ │Providers│ │Analytics│◀───────┘     ││
│   │  └────────┘ └────────┘ └────────┘ └────────┘              ││
│   └───────────────────────────────────────────────────────────┘│
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              POSTGRES + REDIS (Data Layer)               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
demiurge-lead-matcher/
├── apps/
│   ├── web/                          # Next.js Dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx          # Main dashboard
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   └── api/              # API routes
│   │   │   │       ├── leads/        # Lead CRUD
│   │   │   │       ├── sources/      # Source management
│   │   │   │       ├── providers/    # Provider API
│   │   │   │       └── stats/        # Analytics
│   │   │   └── components/
│   │   │       ├── LeadFeed.tsx      # Live lead feed
│   │   │       ├── SourceManager.tsx # Source config
│   │   │       ├── ProviderPanel.tsx # Provider DB
│   │   │       └── StatsPanel.tsx    # Analytics
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── worker/                       # Crawler Worker
│       ├── src/
│       │   ├── crawler.ts            # Crawlee crawler
│       │   ├── processor.ts          # Intent processor
│       │   ├── index.ts              # Worker entry
│       │   └── test-intent.ts        # Test script
│       ├── package.json
│       └── Dockerfile
│
├── packages/
│   ├── core/                         # Shared Logic
│   │   └── src/
│   │       ├── intent-detector.ts    # NLP intent detection
│   │       ├── matching-engine.ts    # Provider matching
│   │       ├── outreach.ts           # Message generation
│   │       └── index.ts              # Pipeline orchestration
│   │
│   └── database/                     # Database Layer
│       ├── schema.sql                # Full schema
│       └── src/
│           ├── types.ts              # TypeScript types
│           ├── client.ts             # Supabase client
│           └── index.ts
│
├── docker-compose.yml                # Infrastructure
├── package.json                      # Workspace root
└── README.md                         # Full documentation
```

## Quick Start (5 minutes)

### 1. Start Infrastructure
```bash
cd /Users/highercognitions/Downloads/lead-magnet

# Start Postgres and Redis
docker-compose up -d postgres redis
```

### 2. Setup Database
```bash
# Create database and tables
psql -h localhost -U demiurge -d demiurge -f packages/database/schema.sql

# Password: demiurge_secret
```

### 3. Configure Environment
```bash
cp .env.example .env

# Edit .env with these values:
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=dummy-key
SUPABASE_SERVICE_KEY=dummy-key
REDIS_URL=redis://localhost:6379
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the System

**Terminal 1 - Dashboard:**
```bash
cd apps/web
npm install
npm run dev
# Dashboard at http://localhost:3000
```

**Terminal 2 - Worker:**
```bash
cd apps/worker
npm install
npm run dev
# Worker starts crawling
```

## Test the System

### Test Intent Detection
```bash
cd apps/worker
npx tsx src/test-intent.ts "Urgently need a plumber in Downtown!"
```

**Expected Output:**
```
📊 DETECTED INTENT:
  Service: plumbing (confidence: 100%)
  Urgency: urgent (score: 6)
  Budget: standard (confidence: 0%)
  Locations: Downtown
  Quality Score: 95/100
  Is Qualified: ✅ YES

📡 SIGNALS:
  ✓ has service mention
  ✓ has urgency signal
  ✓ has location
  ✓ has timeline
  ✓ ready to hire
```

### Test via Dashboard
1. Open http://localhost:3000
2. Go to **Sources** tab
3. Click **+ Add Source**
4. Add a test source (or use manual test)
5. Go to **Live Leads** tab
6. Wait for leads to appear (or add manually)

## API Endpoints

### Leads
```bash
# Get all leads
curl http://localhost:3000/api/leads

# Get leads by status
curl http://localhost:3000/api/leads?status=new

# Approve a lead
curl -X POST http://localhost:3000/api/leads/{id}/approve

# Reject a lead
curl -X POST http://localhost:3000/api/leads/{id}/reject
```

### Sources
```bash
# List sources
curl http://localhost:3000/api/sources

# Add source (via dashboard or direct DB insert)
```

### Providers
```bash
# List providers
curl http://localhost:3000/api/providers
```

### Stats
```bash
# Get analytics
curl http://localhost:3000/api/stats

# Get system status
curl http://localhost:3000/api/status
```

## Database Schema (Key Tables)

### providers
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| business_name | text | Company name |
| services | text[] | Service categories |
| service_areas | text[] | Geographic areas |
| emergency_available | boolean | 24/7 service |
| rating | decimal | 0-5 rating |
| price_tier | enum | budget/standard/premium |

### sources
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| name | text | Source name |
| source_type | enum | reddit/forum/website |
| base_url | text | URL to crawl |
| status | enum | active/paused/error |
| crawl_frequency_minutes | int | Crawl interval |

### leads
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| status | enum | workflow status |
| priority_score | int | 0-100 quality |
| match_count | int | Provider matches |
| detected_at | timestamp | Created time |

### lead_matches
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| lead_id | uuid | → leads |
| provider_id | uuid | → providers |
| match_score | int | 0-100 match % |
| match_reasons | text[] | Why matched |
| status | enum | outreach status |

## Key Features

### 1. Intent Detection
- **15+ service categories** (plumbing, electrical, HVAC, etc.)
- **Urgency levels** (urgent/high/medium/low)
- **Budget signals** (budget/standard/premium)
- **Location extraction** (cities, postcodes)
- **Spam filtering** (>70% accuracy)
- **Duplicate detection** (content hashing)

### 2. Provider Matching
- **6-factor scoring** algorithm:
  - Service match (35%)
  - Location (25%)
  - Urgency (15%)
  - Rating (10%)
  - Price (10%)
  - Availability (5%)
- **Risk flags** for low performers
- **Historical conversion** weighting

### 3. Outreach System
- **Multi-channel** (SMS, Email, WhatsApp, Facebook)
- **Template-based** with variable substitution
- **Human approval** workflow
- **Compliance tracking**

### 4. Dashboard
- **Real-time** lead feed
- **Source management** (pause/resume/crawl)
- **Provider database**
- **Analytics** (conversions, top services)
- **Compliance badges**

## Configuration

### Crawler Settings (.env)
```bash
CRAWLER_ENABLED=true
CRAWLER_MAX_CONCURRENT_JOBS=3
CRAWLER_REQUEST_DELAY_MS=1000
CRAWLER_RETRY_ATTEMPTS=3
```

### Intent Detection (.env)
```bash
INTENT_MIN_CONFIDENCE=0.6
LEAD_AUTO_APPROVE_SCORE=85
MATCHING_MIN_SCORE=50
```

### Compliance (.env)
```bash
OUTREACH_REQUIRE_APPROVAL=true
DATA_RETENTION_DAYS=90
RESPECT_ROBOTS_TXT=true
```

## Troubleshooting

### Database Connection Issues
```bash
# Check Postgres is running
docker-compose ps postgres

# Check connection
psql -h localhost -U demiurge -d demiurge -c "SELECT 1"
```

### Worker Not Crawling
```bash
# Check Redis is running
docker-compose ps redis

# Check worker logs
docker-compose logs -f worker
```

### Dashboard API Errors
```bash
# Check environment variables
cat apps/web/.env.local

# Restart dashboard
npm run dev --workspace=@demiurge/web
```

## Next Steps

1. **Add Real Sources**
   - Reddit API or scraping
   - Forum integrations
   - Website monitoring

2. **Add Providers**
   - Import from CSV
   - Provider self-signup
   - CRM integration

3. **Configure Outreach**
   - Email provider (SendGrid)
   - SMS provider (Twilio)
   - WhatsApp Business API

4. **Deploy**
   - Vercel (dashboard)
   - Railway/Render (worker)
   - Supabase (database)

## Support

- **Documentation:** README.md
- **Architecture:** ARCHITECTURE.md
- **Issues:** GitHub Issues
