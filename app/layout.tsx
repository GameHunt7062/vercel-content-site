import "./globals.css";
import Navbar from "@/components/Navbar";
import type { Metadata, Viewport } from "next";
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

  // "?v=2" forces browsers to re-download the icon (Chrome remembers an old/missing favicon for a long time)
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/icon.png?v=2", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: [{ url: "/apple-icon.png?v=2", sizes: "180x180", type: "image/png" }],
  },
  applicationName: "RAWME",
};

export const viewport: Viewport = {
  themeColor: "#0012ff",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/pmo6wwa.css"
        />
      </head>

      <body>
        <AdminProvider initialIsAdmin={!!admin}>
          <Navbar />
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
