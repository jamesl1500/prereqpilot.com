import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "@/styles/main.scss";
import { ToastProvider } from "@/components/shared/Toast";

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
  metadataBase: new URL("https://www.prereqpilot.com"),
  title: {
    default: "PrereqPilot — Plan Your Path to Grad School & College Programs",
    template: "%s | PrereqPilot",
  },
  description:
    "PrereqPilot helps college students check graduate school eligibility, track course prerequisites, calculate GPA requirements, and build a personalized academic roadmap to their dream program.",
  applicationName: "PrereqPilot",
  authors: [{ name: "James Latten", url: "https://www.jameslatten.com" }],
  creator: "James Latten",
  publisher: "James Latten",
  keywords: [
    // Grad school / program admission
    "grad school planner",
    "graduate school requirements checker",
    "graduate school eligibility",
    "program admission requirements",
    "grad school GPA requirements",
    "check graduate school eligibility",
    "plan grad school application",
    "graduate program prerequisites",
    "grad school preparation tool",
    // Academic planning
    "academic planning tool for college students",
    "course prerequisite tracker",
    "academic roadmap planner",
    "college program requirements",
    "academic transcript planner",
    "GPA calculator for grad school",
    // General
    "academic planning",
    "prerequisite management",
    "student success tools",
    "education planning platform",
  ],
  category: "Education",
  openGraph: {
    title: "PrereqPilot — Plan Your Path to Grad School & College Programs",
    description:
      "Check graduate school eligibility, track prerequisites, and build your academic roadmap — all in one free tool built for college students.",
    url: "https://www.prereqpilot.com",
    siteName: "PrereqPilot",
    images: [
      {
        url: "https://www.prereqpilot.com/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PrereqPilot — Academic Planning Tool for Graduate School",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrereqPilot — Plan Your Path to Grad School & College Programs",
    description:
      "Check grad school eligibility, track prerequisites, and build your academic roadmap — free for college students.",
    images: ["https://www.prereqpilot.com/opengraph-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.prereqpilot.com",
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
