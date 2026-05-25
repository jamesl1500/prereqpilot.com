import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/browse-programs',
          '/classes',
          '/plans',
          '/programs',
          '/scenarios',
          '/settings',
          '/transcript',
          '/institution/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://prereqpilot.com/sitemap.xml',
    host: 'https://prereqpilot.com',
  };
}
