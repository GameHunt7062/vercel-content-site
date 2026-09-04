import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "My Content Site",
  description: "Articles and artwork",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}