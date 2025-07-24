import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/config";
import "./globals.css";
import { AppProvider } from "./providers/app.provider";


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
    default: "DevTeams Copilot - AI-Powered Code Reviews",
    template: "%s | DevTeams Copilot"
  },
  description: "AI-powered code review SaaS for development teams. Get intelligent feedback on code quality, security issues, and best practices.",
  keywords: ["code review", "AI", "development", "GitHub", "automation", "code quality"],
  authors: [{ name: "DevTeams Copilot" }],
  creator: "DevTeams Copilot",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devteamscopilot.com",
    title: "DevTeams Copilot - AI-Powered Code Reviews",
    description: "AI-powered code review SaaS for development teams",
    siteName: "DevTeams Copilot",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevTeams Copilot - AI-Powered Code Reviews",
    description: "AI-powered code review SaaS for development teams",
    creator: "@devteamscopilot",
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
  // manifest: "/manifest.json",
  // icons: {
  //   icon: "/favicon.ico",
  //   shortcut: "/favicon-16x16.png",
  //   apple: "/apple-touch-icon.png",
  // },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <AppProvider session={session}>
          {children}
       </AppProvider>
      </body>
    </html>
  );
}

