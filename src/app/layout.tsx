import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus — The Truth Engine for African Entrepreneurship",
  description:
    "Don't build until you know it's buildable. Nexus automates market research, regulatory audits, and competitive intelligence for the modern African founder.",
  keywords: [
    "startup validation",
    "African entrepreneurship",
    "market research",
    "AI",
    "business intelligence",
  ],
  openGraph: {
    title: "Nexus — The Truth Engine",
    description:
      "Autonomous AI-driven validation for African startup ideas. From gut-feeling to data-backed execution.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
