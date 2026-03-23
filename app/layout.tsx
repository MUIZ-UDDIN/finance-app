import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import PWARegister from "@/components/PWARegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FinanceAI - Smart Money Manager | Track Income & Expenses",
    template: "%s | FinanceAI",
  },
  description: "Free AI-powered personal finance manager. Track income, expenses, budgets, savings goals, and get smart insights. Works offline as a PWA. No signup required to start.",
  keywords: [
    "finance manager", "budget tracker", "expense tracker", "income tracker",
    "personal finance", "money manager", "savings goals", "bill reminders",
    "financial reports", "PWA finance app", "free budget app",
  ],
  authors: [{ name: "FinanceAI Team" }],
  creator: "FinanceAI",
  publisher: "FinanceAI",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://financeai.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "FinanceAI",
    title: "FinanceAI - Smart Money Manager | Track Income & Expenses",
    description: "Free AI-powered personal finance manager. Track income, expenses, budgets, savings goals, and get smart insights.",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "FinanceAI Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "FinanceAI - Smart Money Manager",
    description: "Free AI-powered personal finance manager. Track income, expenses, budgets, and savings goals.",
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceAI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#030712" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
        <PWARegister />
      </body>
    </html>
  );
}
