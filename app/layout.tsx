import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { getAdminUser } from "@/lib/admin";

const SITE_URL = "https://rawme.vercel.app";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const SITE_DESCRIPTION = "Rawme Arzu and his things";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "RAWME",
    template: "%s | RAWME",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "./", // resolves to each page's own URL (pages can override)
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    siteName: "RAWME",
    title: "RAWME",
    description: SITE_DESCRIPTION,
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
    title: "RAWME",
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/pmo6wwa.css"
        />
      </head>

      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AdminProvider initialIsAdmin={!!admin}>
            <Navbar />
            {children}
          </AdminProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
