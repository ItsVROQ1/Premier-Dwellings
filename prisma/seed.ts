import { PrismaClient, PlanTier, AmenityCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // ========================================================================
    // SEED PLAN TIERS
    // ========================================================================
    console.log('📋 Seeding plan tiers...');

    const planTiers = [
      {
        tier: PlanTier.FREE,
        name: 'Free',
        description: 'Get started with basic features',
        price: 0,
        maxListings: 1,
        hasAnalytics: false,
        hasPromotion: false,
        hasPriority: false,
        features: ['Basic listing', 'Email support'],
      },
      {
        tier: PlanTier.STARTER,
        name: 'Starter',
        description: 'Perfect for new agents',
        price: 29.99,
        maxListings: 10,
        hasAnalytics: true,
        hasPromotion: false,
        hasPriority: false,
        features: [
          'Up to 10 listings',
          'Basic analytics',
          'Email & phone support',
          'Featured listings',
        ],
      },
      {
        tier: PlanTier.PROFESSIONAL,
        name: 'Professional',
        description: 'For active agents',
        price: 79.99,
        maxListings: 50,
        hasAnalytics: true,
        hasPromotion: true,
        hasPriority: false,
        features: [
          'Up to 50 listings',
          'Advanced analytics',
          'Promotion tools',
          'Priority support',
          'Virtual tours',
        ],
      },
      {
        tier: PlanTier.PREMIUM,
        name: 'Premium',
        description: 'Enterprise solution',
        price: 199.99,
        maxListings: -1,
        hasAnalytics: true,
        hasPromotion: true,
        hasPriority: true,
        features: [
          'Unlimited listings',
          'Advanced analytics',
          'Full promotion suite',
          '24/7 priority support',
          'Virtual tours',
          'Team management',
          'Custom branding',
        ],
      },
    ];

    for (const tier of planTiers) {
      await prisma.planTierConfig.upsert({
        where: { tier: tier.tier },
        update: {},
        create: tier,
      });
    }

    console.log('✅ Plan tiers seeded');

    // ========================================================================
    // SEED AMENITIES
    // ========================================================================
    console.log('🏠 Seeding amenities...');

    const amenities = [
      // Interior
      { name: 'Air Conditioning', category: AmenityCategory.INTERIOR },
      { name: 'Central Heating', category: AmenityCategory.INTERIOR },
      { name: 'Hardwood Floors', category: AmenityCategory.INTERIOR },
      { name: 'Granite Counters', category: AmenityCategory.INTERIOR },
      {
        name: 'Stainless Steel Appliances',
        category: AmenityCategory.INTERIOR,
      },
      { name: 'Walk-in Closets', category: AmenityCategory.INTERIOR },
      { name: 'Master Suite', category: AmenityCategory.INTERIOR },
      { name: 'Fireplace', category: AmenityCategory.INTERIOR },

      // Exterior
      { name: 'Patio', category: AmenityCategory.EXTERIOR },
      { name: 'Deck', category: AmenityCategory.EXTERIOR },
      { name: 'Pool', category: AmenityCategory.EXTERIOR },
      { name: 'Garden', category: AmenityCategory.EXTERIOR },
      { name: 'Shed', category: AmenityCategory.EXTERIOR },
      { name: 'Balcony', category: AmenityCategory.EXTERIOR },

      // Utilities
      { name: 'Solar Panels', category: AmenityCategory.UTILITIES },
      {
        name: 'Tankless Water Heater',
        category: AmenityCategory.UTILITIES,
      },
      { name: 'Smart Home', category: AmenityCategory.UTILITIES },
      { name: 'Fiber Internet', category: AmenityCategory.UTILITIES },

      // Security
      { name: 'Security System', category: AmenityCategory.SECURITY },
      { name: 'CCTV Cameras', category: AmenityCategory.SECURITY },
      { name: 'Gated Community', category: AmenityCategory.SECURITY },
      { name: 'Guard House', category: AmenityCategory.SECURITY },

      // Entertainment
      { name: 'Home Theater', category: AmenityCategory.ENTERTAINMENT },
      { name: 'Game Room', category: AmenityCategory.ENTERTAINMENT },
      { name: 'Gym', category: AmenityCategory.ENTERTAINMENT },
      { name: 'Sauna', category: AmenityCategory.ENTERTAINMENT },

      // Parking
      { name: 'Garage', category: AmenityCategory.PARKING },
      { name: 'Covered Parking', category: AmenityCategory.PARKING },
      { name: 'Guest Parking', category: AmenityCategory.PARKING },
    ];

    for (const amenity of amenities) {
      await prisma.amenity.upsert({
        where: { name: amenity.name },
        update: {},
        create: amenity,
      });
    }

    console.log('✅ Amenities seeded');

    // ========================================================================
    // SEED CITIES
    // ========================================================================
    console.log('🏙️ Seeding cities...');

    const cities = [
      {
        name: 'New York',
        state: 'NY',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.006,
        description: 'The city that never sleeps',
      },
      {
        name: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        description: 'The City of Angels',
      },
      {
        name: 'Chicago',
        state: 'IL',
        country: 'USA',
        latitude: 41.8781,
        longitude: -87.6298,
        description: 'The Windy City',
      },
      {
        name: 'Houston',
        state: 'TX',
        country: 'USA',
        latitude: 29.7604,
        longitude: -95.3698,
        description: 'Houston we have a solution',
      },
      {
        name: 'Phoenix',
        state: 'AZ',
        country: 'USA',
        latitude: 33.4484,
        longitude: -112.074,
        description: 'Rising from the desert',
      },
      {
        name: 'Philadelphia',
        state: 'PA',
        country: 'USA',
        latitude: 39.9526,
        longitude: -75.1652,
        description: 'The City of Brotherly Love',
      },
      {
        name: 'San Antonio',
        state: 'TX',
        country: 'USA',
        latitude: 29.4241,
        longitude: -98.4936,
        description: 'San Antonio',
      },
      {
        name: 'San Diego',
        state: 'CA',
        country: 'USA',
        latitude: 32.7157,
        longitude: -117.1611,
        description: "America's Finest City",
      },
    ];

    for (const city of cities) {
      await prisma.city.upsert({
        where: { name: city.name },
        update: {},
        create: city,
      });
    }

    console.log('✅ Cities seeded');

    // ========================================================================
    // SEED DEMO USERS
    // ========================================================================
    console.log('👤 Seeding demo users...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Admin user
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        phone: '+1234567890',
        isVerified: true,
        emailVerified: new Date(),
        currentPlan: PlanTier.PREMIUM,
        planStartDate: new Date(),
      },
    });

    // Agent users
    const agentUser1 = await prisma.user.upsert({
      where: { email: 'agent1@example.com' },
      update: {},
      create: {
        email: 'agent1@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: 'AGENT',
        phone: '+1987654321',
        company: 'Premium Realty',
        licenseNumber: 'LIC123456',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isVerified: true,
        emailVerified: new Date(),
        currentPlan: PlanTier.PROFESSIONAL,
        planStartDate: new Date(),
      },
    });

    const agentUser2 = await prisma.user.upsert({
      where: { email: 'agent2@example.com' },
      update: {},
      create: {
        email: 'agent2@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'AGENT',
        phone: '+1555666777',
        company: 'Elite Properties',
        licenseNumber: 'LIC789012',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isVerified: true,
        emailVerified: new Date(),
        currentPlan: PlanTier.STARTER,
        planStartDate: new Date(),
      },
    });

    // Buyer users
    await prisma.user.upsert({
      where: { email: 'buyer1@example.com' },
      update: {},
      create: {
        email: 'buyer1@example.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Davis',
        role: 'BUYER',
        phone: '+1222333444',
        isVerified: true,
        emailVerified: new Date(),
        currentPlan: PlanTier.FREE,
      },
    });

    await prisma.user.upsert({
      where: { email: 'buyer2@example.com' },
      update: {},
      create: {
        email: 'buyer2@example.com',
        password: hashedPassword,
        firstName: 'Emily',
        lastName: 'Wilson',
        role: 'BUYER',
        phone: '+1333444555',
        isVerified: true,
        emailVerified: new Date(),
        currentPlan: PlanTier.FREE,
      },
    });

    console.log('✅ Demo users seeded');

    // ========================================================================
    // SEED SAMPLE LISTINGS
    // ========================================================================
    console.log('🏘️ Seeding sample listings...');

    const newYorkCity = await prisma.city.findUnique({
      where: { name: 'New York' },
    });

    if (newYorkCity) {
      // Get amenities
      const parkingAmenity = await prisma.amenity.findUnique({
        where: { name: 'Garage' },
      });
      const poolAmenity = await prisma.amenity.findUnique({
        where: { name: 'Pool' },
      });

      await prisma.listing.upsert({
        where: { slug: 'luxury-apartment-manhattan-001' },
        update: {},
        create: {
          title: 'Luxury Apartment in Manhattan',
          description:
            'Beautiful luxury apartment with stunning views of Central Park',
          slug: 'luxury-apartment-manhattan-001',
          propertyType: 'APARTMENT',
          status: 'ACTIVE',
          transactionType: 'SALE',
          city: { connect: { id: newYorkCity.id } },
          streetAddress: '123 Park Avenue, Manhattan',
          latitude: 40.7758,
          longitude: -73.9855,
          price: 2500000,
          bedrooms: 3,
          bathrooms: 2.5,
          totalArea: 2500,
          yearBuilt: 2020,
          floorNumber: 45,
          totalFloors: 50,
          isFeatured: true,
          publishedAt: new Date(),
          agent: { connect: { id: agentUser1.id } },
          amenities: {
            connect: [
              { id: parkingAmenity?.id || '' },
              { id: poolAmenity?.id || '' },
            ].filter((a) => a.id),
          },
        },
      });

      await prisma.listing.upsert({
        where: { slug: 'modern-house-brooklyn-001' },
        update: {},
        create: {
          title: 'Modern House in Brooklyn',
          description: 'Contemporary house with rooftop terrace and garden',
          slug: 'modern-house-brooklyn-001',
          propertyType: 'HOUSE',
          status: 'ACTIVE',
          transactionType: 'SALE',
          city: { connect: { id: newYorkCity.id } },
          streetAddress: '456 Williamsburg Street, Brooklyn',
          latitude: 40.7031,
          longitude: -73.9567,
          price: 1800000,
          bedrooms: 4,
          bathrooms: 3,
          totalArea: 3200,
          yearBuilt: 2018,
          isFeatured: true,
          publishedAt: new Date(),
          agent: { connect: { id: agentUser2.id } },
          amenities: {
            connect: [{ id: parkingAmenity?.id || '' }].filter((a) => a.id),
          },
        },
      });

      console.log('✅ Sample listings seeded');
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
