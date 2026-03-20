"use client";

import { useEffect, useRef, useState } from "react";

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
  const [adActive, setAdActive] = useState(false);

  useEffect(() => {
    if (isLoaded.current) return;

    // Don't render if no AdSense ID configured
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
    if (!adsenseId || adsenseId === "ca-pub-XXXXXXXXXX") return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch (e) {
      // AdSense not loaded yet or ad blocker active
      return;
    }

    // Observe the ad container — show only when ad content fills it
    const observer = new MutationObserver(() => {
      if (adRef.current) {
        const ins = adRef.current.querySelector("ins.adsbygoogle");
        if (ins && (ins as HTMLElement).dataset.adStatus === "filled") {
          setAdActive(true);
          observer.disconnect();
        }
      }
    });

    if (adRef.current) {
      observer.observe(adRef.current, { attributes: true, childList: true, subtree: true });
    }

    // Fallback: check after a delay if ad was filled
    const timer = setTimeout(() => {
      if (adRef.current) {
        const ins = adRef.current.querySelector("ins.adsbygoogle");
        if (ins && (ins as HTMLElement).offsetHeight > 0) {
          setAdActive(true);
        }
      }
      observer.disconnect();
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Don't render anything if no AdSense ID
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!adsenseId || adsenseId === "ca-pub-XXXXXXXXXX") return null;

  return (
    <div
      className={`ad-container overflow-hidden transition-all duration-300 ${adActive ? className : ""}`}
      ref={adRef}
      style={{ height: adActive ? "auto" : 0, opacity: adActive ? 1 : 0 }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth ? "true" : "false"}
      />
    </div>
  );
}
