import type { Metadata } from "next";
import { Suspense } from "react";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { ToastProvider } from "@/components/shared/Toast";
import RouteChangeLoader from "@/components/shared/RouteChangeLoader";
import "@/styles/main.scss";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PrereqPilot - Academic Planning Assistant",
  description: "Track courses, calculate GPAs, and plan your path to success",
  applicationName: "PrereqPilot",
  authors: [{ name: "James Latten", url: "https://jameslatten.com" }],
  creator: "James Latten",
  publisher: "James Latten",
  keywords: [
    "academic planning",
    "course tracking",
    "GPA calculator",
    "prerequisite management",
    "student success",
    "education tools",
    "curriculum planning",
  ],
  openGraph: {
    title: "PrereqPilot - Academic Planning Assistant",
    description: "Track courses, calculate GPAs, and plan your path to success",
    url: "https://prereqpilot.com",
    siteName: "PrereqPilot",
    images: [
      {
        url: "https://prereqpilot.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PrereqPilot Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrereqPilot - Academic Planning Assistant",
    description: "Track courses, calculate GPAs, and plan your path to success",
    images: ["https://prereqpilot.com/opengraph-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <ToastProvider>
          <Suspense fallback={null}>
            <RouteChangeLoader />
          </Suspense>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
