import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://financeai.vercel.app";

  const routes = [
    "",
    "/income",
    "/expenses",
    "/transactions",
    "/budgets",
    "/recurring",
    "/bills",
    "/accounts",
    "/savings",
    "/reports",
    "/insights",
    "/settings",
    "/profile",
    "/about",
    "/contact",
    "/auth",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
