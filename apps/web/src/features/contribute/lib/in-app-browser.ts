/**
 * Detects browsers embedded inside another app's webview (Facebook,
 * Instagram, TikTok, LinkedIn, Snapchat, WeChat, Line). These can't
 * complete a Google OAuth round trip, so the sign-in sheet opens straight
 * in S11 ("Google isn't available in this browser") instead of offering it.
 */
const IN_APP_BROWSER_TOKENS = [
  "FBAN",
  "FBAV",
  "FB_IAB",
  "Instagram",
  "musical_ly",
  "BytedanceWebview",
  "LinkedInApp",
  "Snapchat",
  "MicroMessenger",
  "Line/",
] as const;

export function isInAppBrowser(ua: string): boolean {
  if (!ua) return false;
  return IN_APP_BROWSER_TOKENS.some((token) => ua.includes(token));
}
