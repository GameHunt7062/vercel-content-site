import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://rawme.vercel.app"),

  title: "RAWME",
  description: "The personal website of ARZU.",

  openGraph: {
    title: "RAWME ARZU",
    url: "https://rawme.vercel.app",
    siteName: "RAWME ARZU",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 675,
        alt: "RAWME ARZU",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RAWME ARZU",
    images: ["/og-image.jpg"],
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
