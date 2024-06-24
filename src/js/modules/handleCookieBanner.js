import { getAccessToken } from "../variables.js";

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

const getTopLevelDomain = () => {
  const fullDomain = window.location.hostname;
  const domainRegex = /\.([a-z]{2,})\.([a-z]{2,})$/;
  const match = fullDomain.match(domainRegex);
  if (match) {
    return `.${match[1]}.${match[2]}`;
  } else {
    return fullDomain;
  }
};

const cookieConfig = `path=/; domain=${getTopLevelDomain()};max-age=3600`;

const handleCookieBanner = ({ country, lpDataLayer, discountCode }) => {
  const STOREFRONT_DOMAIN = "buckedup.com";
  const CHECKOUT_DOMAIN = getCheckoutDomain(country);
  const SF_API_TOKEN = getAccessToken(country);
  try {
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    privacyBanner.loadBanner({
      storefrontAccessToken: SF_API_TOKEN,
      checkoutRootDomain: CHECKOUT_DOMAIN,
      storefrontRootDomain: STOREFRONT_DOMAIN,
    });
    document.addEventListener("visitorConsentCollected", (event) => {
      if (event.analyticsAllowed && event.thirdPartyMarketingAllowed && event.saleOfDataAllowed) {
        fbq("consent", "grant");
        gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
        });
        document.cookie = `offer_id=${discountCode};${cookieConfig}`;
        document.cookie = `page_id=${lpDataLayer.page_id};${cookieConfig}`;
        console.log("ALLOWED");
      } else {
        fbq("consent", "revoke");
        gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
        });
        console.log("DENIED");
      }
    });
  } catch (err) {
    console.warn("Error on cookie banner.", err);
  }
};

export default handleCookieBanner;
