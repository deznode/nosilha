import { describe, it, expect } from "vitest";
import { isInAppBrowser } from "@/features/contribute/lib/in-app-browser";

describe("isInAppBrowser", () => {
  it.each([
    [
      "Facebook FBAN",
      "Mozilla/5.0 (Linux; Android 10) ... [FBAN/FB4A;FBAV/300.0]",
    ],
    [
      "Facebook FBAV",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... FBAV/400.0",
    ],
    ["Facebook FB_IAB", "Mozilla/5.0 (Linux; Android 10) ... FB_IAB/FB4A"],
    [
      "Instagram",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... Instagram 250.0.0.21.109",
    ],
    [
      "TikTok musical_ly",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... musical_ly_2022",
    ],
    [
      "TikTok BytedanceWebview",
      "Mozilla/5.0 (Linux; Android 10) ... BytedanceWebview/d8a21c6",
    ],
    [
      "LinkedIn",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... LinkedInApp/9.28.0",
    ],
    [
      "Snapchat",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... Snapchat/12.1.0",
    ],
    [
      "WeChat MicroMessenger",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... MicroMessenger/8.0.0",
    ],
    ["Line", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) ... Line/13.0.0"],
  ])("returns true for %s", (_label, ua) => {
    expect(isInAppBrowser(ua)).toBe(true);
  });

  it.each([
    [
      "mobile Safari",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    ],
    [
      "desktop Safari",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    ],
    [
      "mobile Chrome",
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    ],
    [
      "desktop Chrome",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    ],
    [
      "mobile Firefox",
      "Mozilla/5.0 (Android 13; Mobile; rv:115.0) Gecko/115.0 Firefox/115.0",
    ],
    [
      "desktop Firefox",
      "Mozilla/5.0 (X11; Linux x86_64; rv:115.0) Gecko/20100101 Firefox/115.0",
    ],
  ])("returns false for %s", (_label, ua) => {
    expect(isInAppBrowser(ua)).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isInAppBrowser("")).toBe(false);
  });
});
