import type { MetadataRoute } from "next";

const SITE_URL = "https://rawme.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login"], // admin/login pages search me nahi aane chahiye
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
