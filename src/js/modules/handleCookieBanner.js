import { getAccessToken } from "../variables";

const getCheckoutDomain = (country) => {
  switch (country) {
    case "ca":
      return "cad.buckedup.com";
    case "au":
      return "aud.buckedup.com";
    case "uk":
      return "gbp.buckedup.com";
    default:
      return "secure.buckedup.com";
  }
};

const handleCookieBanner = (country) => {
  const STOREFRONT_DOMAIN = "buckedup.com";
  const CHECKOUT_DOMAIN = getCheckoutDomain(country);
  const SF_API_TOKEN = getAccessToken(country);
  try {
    privacyBanner.loadBanner({
      storefrontAccessToken: SF_API_TOKEN,
      checkoutRootDomain: CHECKOUT_DOMAIN,
      storefrontRootDomain: STOREFRONT_DOMAIN,
    });
    document.addEventListener("visitorConsentCollected", (event) => console.log("changed", event.detail));
  } catch (err) {
    console.warn("Can't add cookie banner.", err);
  }
};

export default handleCookieBanner;
