import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers/auth-provider';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const siteUrl = 'https://www.chhattisgarhshadi.com';
const siteName = 'Chhattisgarh Shadi';
const siteDescription = 'छत्तीसगढ़ियों का अपना विवाह मंच - Find your perfect life partner from Chhattisgarh. Trusted matrimony platform connecting Chhattisgarhi families since 2024.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - #1 Matrimony for Chhattisgarh`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'Chhattisgarh matrimony',
    'Chhattisgarhi shadi',
    'CG marriage',
    'Raipur matrimony',
    'Bilaspur matrimony',
    'Durg matrimony',
    'छत्तीसगढ़ विवाह',
    'छत्तीसगढ़ी शादी',
    'Hindu matrimony Chhattisgarh',
    'Chhattisgarh bride groom',
    'CG shadi app',
    'free matrimony Chhattisgarh',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  applicationName: siteName,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    alternateLocale: 'en_IN',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - #1 Matrimony for Chhattisgarh`,
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${siteName} - Find your perfect match`,
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - #1 Matrimony for Chhattisgarh`,
    description: siteDescription,
    images: ['/og-image.png'],
    creator: '@chhattisgarhshadi',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/manifest.json',

  // Verification (add your actual verification codes)
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },

  // Category
  category: 'Matrimony',

  // Other
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': siteName,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'Chhattisgarhshadi@gmail.com',
          areaServed: 'IN',
          availableLanguage: ['Hindi', 'English'],
        },
      ],
      sameAs: [
        'https://play.google.com/store/apps/details?id=com.chhattisgarhshadi',
        // Add social media links here
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: ['hi-IN', 'en-IN'],
    },
    {
      '@type': 'WebApplication',
      '@id': `${siteUrl}/#app`,
      name: siteName,
      description: siteDescription,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Android, iOS',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
    },
    {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}/#business`,
      name: siteName,
      description: 'Matrimony service for Chhattisgarh region',
      email: 'Chhattisgarhshadi@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressRegion: 'Chhattisgarh',
        addressCountry: 'IN',
      },
      areaServed: {
        '@type': 'State',
        name: 'Chhattisgarh',
      },
      priceRange: '₹₹',
    },
  ],
};

import { ThemeProvider } from '@/components/providers/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning translate="no" className={ptSans.variable}>
      <head>
        <link rel="canonical" href={siteUrl} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
