import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


import { ClerkProvider } from '@clerk/nextjs'
import { CLERK_CONFIG } from '@/lib/clerk-config'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { AuthProvider } from '@/components/auth-provider'
import { NavHeader } from '@/components/nav-header'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MentoLoop - Nurse Practitioner Platform",
    template: "%s | MentoLoop"
  },
  description: "Connect nurse practitioner students with experienced preceptors for personalized mentorship and clinical rotations",
  keywords: ["nurse practitioner", "NP mentorship", "clinical rotations", "preceptors", "nurse practitioner students", "healthcare education", "nursing"],
  authors: [{ name: "MentoLoop" }],
  creator: "MentoLoop",
  publisher: "MentoLoop",
  metadataBase: new URL('https://mentoloop.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mentoloop.com",
    title: "MentoLoop - Nurse Practitioner Platform",
    description: "Connect nurse practitioner students with experienced preceptors for personalized mentorship and clinical rotations",
    siteName: "MentoLoop",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentoLoop - Nurse Practitioner Platform",
    description: "Connect nurse practitioner students with experienced preceptors for personalized mentorship and clinical rotations",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}
      >
        <ClerkProvider
            appearance={CLERK_CONFIG.appearance}
            localization={CLERK_CONFIG.localization}
            signInUrl={CLERK_CONFIG.signInUrl}
            signUpUrl={CLERK_CONFIG.signUpUrl}
            signInFallbackRedirectUrl={CLERK_CONFIG.signInFallbackRedirectUrl}
            signUpFallbackRedirectUrl={CLERK_CONFIG.signUpFallbackRedirectUrl}
            signInForceRedirectUrl={CLERK_CONFIG.signInForceRedirectUrl}
            signUpForceRedirectUrl={CLERK_CONFIG.signUpForceRedirectUrl}
          >
            <ConvexClientProvider>
              <AuthProvider>
                <NavHeader />
                {children}
              </AuthProvider>
            </ConvexClientProvider>
          </ClerkProvider>
      </body>
    </html>
  );
}