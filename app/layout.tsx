import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { NavHeader } from '@/components/nav-header'
import { DemoRoleSwitcher } from '@/components/demo-role-switcher'


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
    default: "MentoLoop - Medical Mentorship Platform",
    template: "%s | MentoLoop"
  },
  description: "Connect medical students with experienced preceptors for personalized mentorship and clinical rotations",
  keywords: ["medical mentorship", "clinical rotations", "preceptors", "medical students", "healthcare education"],
  authors: [{ name: "MentoLoop" }],
  creator: "MentoLoop",
  publisher: "MentoLoop",
  metadataBase: new URL('https://mentoloop.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mentoloop.com",
    title: "MentoLoop - Medical Mentorship Platform",
    description: "Connect medical students with experienced preceptors for personalized mentorship and clinical rotations",
    siteName: "MentoLoop",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentoLoop - Medical Mentorship Platform",
    description: "Connect medical students with experienced preceptors for personalized mentorship and clinical rotations",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexClientProvider>
              <NavHeader />
              {children}
              <DemoRoleSwitcher />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}