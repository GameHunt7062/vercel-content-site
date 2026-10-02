import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";

const SITE_URL = "https://rawme.vercel.app";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "RAWME",
    template: "%s | RAWME",
  },
  alternates: {
    canonical: SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "RAWME",
    images: [
      {
        url: OG_IMAGE,
        secureUrl: OG_IMAGE,
        width: 1200,
        height: 675,
        type: "image/jpeg",
        alt: "RAWME",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/pmo6wwa.css"
        />

        {/* Open Graph fallback */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="RAWME" />
        <meta
          property="og:description"
          content="The personal website of GameHunt."
        />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="675" />
        <meta property="og:image:alt" content="RAWME" />

        {/* Twitter/X fallback */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RAWME" />
        <meta
          name="twitter:description"
          content="The personal website of GameHunt."
        />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Basic crawler metadata */}
        <meta name="robots" content="index, follow" />
      </head>

      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
