"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical";
  fullWidth?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({
  adSlot,
  adFormat = "auto",
  fullWidth = true,
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch (e) {
      // AdSense not loaded yet or ad blocker active
    }
  }, []);

  return (
    <div className={`ad-container overflow-hidden ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-XXXXXXXXXX"}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth ? "true" : "false"}
      />
    </div>
  );
}
