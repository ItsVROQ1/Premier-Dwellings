# Premium Real Estate Platform

A modern, full-featured real estate marketplace built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## 🎯 Features

- **User Roles**: Buyers, Agents, and Admin users with role-based features
- **Property Listings**: Comprehensive listing management with images, amenities, and pricing
- **Search & Filtering**: Advanced search by location, price, property type, and amenities
- **Favorites**: Save and manage favorite listings
- **Messaging**: In-app chat system for property inquiries
- **Offers & Transactions**: Make and manage property offers
- **Verifications**: Multi-step user verification (email, phone, identity, documents)
- **Subscription Plans**: Tiered plans (Free, Starter, Professional, Premium)
- **Payments**: Integrated payment processing
- **Analytics**: Track listing views, favorites, and user behavior
- **Blog**: Content management for real estate articles
- **Plot Overlays**: Mapping and property boundary visualization
- **Premium Design**: Dark mode support with gold accent tokens and premium typography

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Environment variables configured (see `.env.example`)

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and API keys
   ```

3. **Initialize the database:**
   ```bash
   pnpm prisma migrate dev
   ```
   This will:
   - Create the database schema
   - Generate Prisma client
   - Run all migrations

4. **Seed initial data:**
   ```bash
   pnpm prisma db seed
   ```
   This populates:
   - Plan tier configurations
   - Amenities catalog
   - Sample cities
   - Demo users (see below)
   - Sample listings

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   Visit `http://localhost:3000` to see the themed shell and component showcase

## 📚 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Database
pnpm prisma:generate # Generate Prisma client
pnpm prisma:migrate  # Run database migrations
pnpm prisma:db:seed  # Seed initial data
pnpm prisma studio   # Open Prisma Studio (requires npx)
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:

### Core Models
- **User**: Platform users with roles (BUYER/AGENT/ADMIN)
- **Listing**: Property listings with detailed specifications
- **City**: Geographic locations for listings
- **Amenity**: Property amenities and features

### Transaction Models
- **Offer**: Property offers from buyers
- **Payment**: Payment transactions
- **Verification**: User verification status

### Engagement Models
- **ListingInquiry**: Inquiries about listings
- **FavoritedListing**: User's favorite listings
- **Chat/ChatMessage**: In-app messaging
- **BlogPost**: Real estate articles

### Configuration Models
- **PlanTierConfig**: Subscription plan definitions

### Analytics Models
- **AnalyticsEvent**: User activity tracking
- **PlotOverlay**: Property boundary mapping

## 🎨 Design System

### Color Tokens
- **Gold** (Premium): `#ffd633` - Primary accent color
- **Dark Mode**: Full support with HSL variables
- **Semantic Colors**: Success, Danger, Warning states

### Typography
- Premium system font stack with fallbacks
- 8-level font size scale (xs to 6xl)
- Multiple line-height and letter-spacing options

### Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, destructive, success)
- **Card**: Reusable card layout with sections
- **Input**: Text input with focus states
- **Skeleton**: Loading placeholder
- **Shell**: Layout wrapper with header, main, footer

## 👥 Demo Credentials

After seeding, use these credentials to test the application:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | Admin |
| agent1@example.com | password123 | Agent |
| agent2@example.com | password123 | Agent |
| buyer1@example.com | password123 | Buyer |
| buyer2@example.com | password123 | Buyer |

## 🔧 Configuration

### Environment Variables

Key environment variables to configure (see `.env.example` for complete list):

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Email (Resend or SMTP)
RESEND_API_KEY=re_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment (Stripe or PayPal)
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Maps
GOOGLE_MAPS_API_KEY=...

# Storage (AWS S3, Cloudinary, or Supabase)
AWS_S3_ACCESS_KEY_ID=...
AWS_S3_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=...
```

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Shell
│   ├── page.tsx           # Home page with component showcase
│   └── globals.css        # Design tokens and global styles
├── components/
│   ├── ui/                # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   └── layout/            # Layout components
│       └── shell.tsx
├── lib/
│   ├── utils.ts           # Utility functions (cn, etc.)
│   └── generated/
│       └── prisma/        # Generated Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seed script
│   └── migrations/        # Database migrations
├── public/                # Static assets
├── .env.example           # Environment variable template
├── .prettierrc             # Prettier configuration
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔐 Security Considerations

1. **Passwords**: All passwords are hashed with bcryptjs (rounds: 12)
2. **Environment Variables**: Keep `.env` in `.gitignore` - never commit secrets
3. **Authentication**: Use NextAuth for secure session management
4. **API Routes**: Implement proper authorization checks
5. **Database**: Use parameterized queries via Prisma ORM
6. **Input Validation**: Validate all user inputs before processing

## 📖 Next Steps for Development

1. **Authentication**: Implement NextAuth with OAuth providers
2. **API Routes**: Create API endpoints for CRUD operations
3. **Pages**: Build feature pages (listings, search, profile, etc.)
4. **Error Handling**: Implement error boundaries and logging
5. **Testing**: Add unit and integration tests
6. **Deployment**: Configure CI/CD and deploy to production

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📝 License

This project is private and confidential.

## 🆘 Support

For questions or issues, please contact the development team.

---

**Last Updated**: December 2024
**Next.js Version**: 16.0.10
**Prisma Version**: 6.19.1
**Tailwind CSS Version**: 4.1.18
