export function generateImageAlt(context: {
  title: string;
  propertyType?: string;
  city?: string;
  index?: number;
}): string {
  const { title, propertyType, city, index } = context;
  
  const parts = [];
  
  if (index !== undefined && index > 0) {
    parts.push(`Image ${index + 1}`);
  }
  
  if (propertyType) {
    parts.push(propertyType.replace('_', ' ').toLowerCase());
  }
  
  parts.push(title);
  
  if (city) {
    parts.push(`in ${city}`);
  }
  
  return parts.join(' - ');
}

export function generateMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

export function generatePageTitle(parts: string[]): string {
  return [...parts, 'Premium Estate'].join(' | ');
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Premium Estate',
    description: 'Premium real estate platform for buying, selling, and renting properties in Pakistan',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Pakistan',
    },
    sameAs: [
      'https://facebook.com/premiumestate',
      'https://twitter.com/premiumestate',
      'https://instagram.com/premiumestate',
    ],
  };
}
