# AI & Advanced Features Documentation

This document describes the AI-powered and advanced features implemented in the Premium Real Estate Platform.

## 🤖 Real-Time Chat with AI Assistant

### Overview
Bidirectional real-time chat system using Socket.io, connecting buyers and agents with AI-powered assistance.

### Features
- Real-time messaging between buyers and agents
- AI assistant that greets new inquiries automatically
- Suggests similar listings based on user interests
- Content moderation using OpenAI's moderation API
- Chat threads scoped to listings/inquiries
- Message persistence in database
- Typing indicators
- Read receipts

### API Endpoints
- `GET /api/chat?userId={id}` - Get user's chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/[id]` - Get chat messages
- `POST /api/ai-assistant` - Process AI interactions
- `GET /api/ai-assistant?userId={id}` - Get AI config
- `PUT /api/ai-assistant` - Update AI settings

### Components
- `/components/chat/chat-interface.tsx` - Main chat UI
- `/app/dashboard/ai-settings/page.tsx` - AI configuration dashboard

### Database Models
- `Chat` - Chat thread with participants
- `ChatMessage` - User messages
- `AIChatMessage` - AI-generated messages
- `AIAssistantConfig` - Per-agent AI settings
- `ChatParticipant` - User participation in chats

### Socket Events
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `send-message` - Send a message
- `new-message` - Receive a message
- `typing` - User is typing
- `stop-typing` - User stopped typing

## 💰 AI Property Valuation

### Overview
AI-powered property valuation combining Google Maps geocoding, property attributes, and historical platform data.

### Features
- Data-backed price estimates in PKR
- Price range (min/max/median) calculations
- Confidence scores based on data availability
- Price per square foot analysis
- Market trend factors (3/6/12 month trends)
- Comparable property analysis
- Property-specific adjustments

### API Endpoints
- `POST /api/valuation` - Generate property valuation

### Components
- `/components/valuation/valuation-widget.tsx` - Valuation UI widget
- Integrated on property detail pages

### Database Models
- `AreaPriceIndex` - Aggregated price data by area/type
- `ValuationSample` - Individual property sale/listing records

### Valuation Algorithm
1. Fetch area price index for property location
2. Query comparable properties (same city, type, price range)
3. Calculate base price per sqft from historical data
4. Apply adjustment factors:
   - Market trends (3/6/12 month growth)
   - Property size (larger = premium)
   - Bedroom count (4+ = premium)
   - Location factors
5. Calculate confidence based on sample size
6. Return price range and factors

### Default Price Per Sqft (PKR)
```
Karachi:
  - Apartment: 8,000
  - House: 10,000
  - Villa: 15,000

Lahore:
  - Apartment: 7,500
  - House: 9,500
  - Villa: 14,000

Islamabad:
  - Apartment: 9,000
  - House: 12,000
  - Villa: 18,000
```

## 🗺️ Interactive Plot Finder

### Overview
Interactive map with society overlays using Leaflet and GeoJSON for plot/block search and visualization.

### Features
- Interactive Leaflet map with OpenStreetMap tiles
- Society boundary overlays (GeoJSON polygons)
- Plot and block search functionality
- Zoom to specific locations
- Popup information on click
- City-based filtering

### API Endpoints
- `GET /api/society-overlays?cityId={id}` - Get overlays for city
- `POST /api/society-overlays` - Upload new overlay (admin)

### Pages
- `/app/plot-finder/page.tsx` - Public plot finder
- `/app/admin/overlays/page.tsx` - Admin overlay management

### Components
- `/components/plot-finder/plot-finder-map.tsx` - Interactive map component

### Database Models
- `SocietyOverlay` - GeoJSON boundary data for societies

### Creating GeoJSON Overlays
1. Visit https://geojson.io
2. Use polygon tool to draw society boundaries
3. Add properties (name, etc.)
4. Copy JSON and upload via admin panel

## 🏦 Mortgage Calculator

### Overview
Comprehensive mortgage calculator with Pakistani bank presets and eligibility assessment.

### Features
- Monthly payment calculation
- Support for 8 major Pakistani banks
- Interest rates: 17.5% - 18.5% per annum
- Loan eligibility check (40% income rule)
- Down payment calculator
- Total interest calculation
- Reducing balance method

### Banks Supported
- HBL (18.5%)
- UBL (18.0%)
- MCB (17.5%)
- Allied Bank (18.2%)
- Meezan Bank (17.8%)
- Bank Alfalah (18.3%)
- Faysal Bank (18.0%)
- Standard Chartered (17.9%)

### Components
- `/components/calculators/mortgage-calculator.tsx`

### Pages
- `/app/tools/page.tsx` - Tools dashboard with calculator

### Calculations
```
Monthly Payment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)

Where:
P = Principal loan amount
r = Monthly interest rate (annual / 12)
n = Number of payments (years * 12)

Eligibility = Monthly Payment ≤ 40% of Monthly Income
```

## 📊 Area Price Index Dashboard

### Overview
Public dashboard showing market trends, trending areas, and investment insights.

### Features
- 3/6/12-month trend visualization
- Top trending areas by growth percentage
- AI-generated investment insights
- Recent price data by city/area
- Property type filtering
- Sample size indicators

### API Endpoints
- `GET /api/price-index?city={name}&propertyType={type}&months={count}`

### Components
- `/components/price-index/price-index-dashboard.tsx`

### Pages
- `/app/tools/page.tsx` - Includes price index tab

### Insights Generation
AI automatically generates insights based on:
- Growth rate > 5% = Strong Market Growth
- 6-month growth > 10% = Investment Opportunity
- Low sample size = Data quality warning

## 🔍 SEO Foundation

### Overview
Comprehensive SEO implementation with structured data, meta tags, and performance optimizations.

### Features Implemented

#### 1. Dynamic Meta Tags
- Page-specific titles and descriptions
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs

#### 2. Structured Data (JSON-LD)
- **RealEstateListing**: Property detail pages
- **BlogPosting**: Blog posts
- **Organization**: Site-wide company info
- **BreadcrumbList**: Navigation paths

#### 3. Image Optimization
- Alt text enforcement on all images
- Helper functions for generating descriptive alt text
- Next.js Image component integration ready

#### 4. Performance
- Server-side rendering for content pages
- Dynamic imports for heavy components (maps)
- Loading states for async operations
- Efficient database queries with indexes

### SEO Helpers
Located in `/lib/seo-helpers.ts`:
- `generateImageAlt()` - Create descriptive alt text
- `generateMetaDescription()` - Truncate with ellipsis
- `generatePageTitle()` - Consistent title format
- `generateBreadcrumbSchema()` - Breadcrumb JSON-LD
- `generateOrganizationSchema()` - Company structured data

### Validation
Test structured data using:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
GOOGLE_MAPS_API_KEY="..."
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Package Dependencies
```json
{
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1",
  "openai": "^6.10.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "@types/leaflet": "^1.9.21",
  "@googlemaps/js-api-loader": "^2.0.2"
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables
Copy `.env` and fill in your API keys:
- OpenAI API key for AI assistant
- Google Maps API key for geocoding

### 3. Run Database Migrations
```bash
pnpm prisma migrate dev
```

### 4. Start Development Server
```bash
pnpm dev
```

## 📝 Usage Examples

### Enable AI Assistant (Agent Dashboard)
1. Navigate to `/dashboard/ai-settings`
2. Toggle "Enable AI Assistant"
3. Configure greeting and features
4. Save settings

### Generate Property Valuation
1. Visit any property detail page
2. Click "Generate Valuation" in the AI Valuation widget
3. View estimated price range and factors

### Use Plot Finder
1. Navigate to `/plot-finder`
2. Select a city or search for a society
3. Click on map overlays for details

### Calculate Mortgage
1. Go to `/tools`
2. Enter property price and details
3. Select bank and view monthly payment

### View Price Trends
1. Navigate to `/tools`
2. Click "Price Index" tab
3. View trending areas and insights

## 🎯 Admin Features

### Manage Society Overlays
1. Access `/admin/overlays`
2. Create GeoJSON using geojson.io
3. Upload overlay with city ID and name
4. Overlays appear automatically on plot finder

### Monitor AI Conversations
- AI messages are stored in `AIChatMessage` table
- Moderation flags are automatically applied
- Review flagged content in database

## 🔒 Security & Moderation

### Content Moderation
- All messages automatically checked via OpenAI Moderation API
- Flags: harassment, hate, sexual, violence, self-harm
- Moderated content marked in database for review

### API Rate Limiting
Consider implementing rate limiting for:
- Valuation requests
- Chat message sending
- Overlay uploads

## 📈 Performance Tips

1. **Caching**: Implement caching for price index data
2. **Lazy Loading**: Maps and charts load on demand
3. **Database Indexes**: All foreign keys and query fields indexed
4. **Image Optimization**: Use Next.js Image component
5. **API Pagination**: Implement for large result sets

## 🐛 Troubleshooting

### Socket.io Connection Issues
- Ensure `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Check CORS configuration in socket server

### Valuation Returns Zero
- Verify database has price index data
- Check default prices in `ai-valuation.ts`
- Ensure property attributes are valid

### Map Not Loading
- Check Leaflet CSS is imported
- Verify component is dynamically imported
- Disable SSR for map component

### AI Assistant Not Responding
- Verify `OPENAI_API_KEY` is valid
- Check API usage limits
- Review error logs in console

## 🛣️ Roadmap

Future enhancements:
- [ ] Voice chat integration
- [ ] Video tours with AI narration
- [ ] Predictive analytics dashboard
- [ ] Automated property comparisons
- [ ] Smart contract integration
- [ ] Mobile apps (React Native)
- [ ] Advanced filtering in plot finder
- [ ] 3D property visualizations

## 📚 Additional Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Leaflet Documentation](https://leafletjs.com/)
- [GeoJSON Specification](https://geojson.org/)
- [Schema.org RealEstate](https://schema.org/RealEstateListing)
