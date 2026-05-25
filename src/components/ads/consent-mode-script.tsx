import { isAdFreeFromCookies } from "@/lib/ad-free-server";
import { isAdsConfigured } from "@/lib/ads";

export async function ConsentModeScript() {
  if (!isAdsConfigured()) return null;
  if (await isAdFreeFromCookies()) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `,
      }}
    />
  );
}
