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

const tryFbq = (consent) => {
  try {
    fbq("consent", consent);
  } catch (e) {
    console.warn("failed fbq", e);
  }
};

const tryGtag = ({consent, step}) =>{
  try {
    gtag("consent", step, {
      ad_storage: consent,
      analytics_storage: consent,
      personalization_storage: consent,
    });
  } catch (e) {
    console.warn("Error on gtag", e);
  }
}

const handleCookieBanner = ({ country }) => {
  const STOREFRONT_DOMAIN = "buckedup.com";
  const CHECKOUT_DOMAIN = getCheckoutDomain(country);
  const SF_API_TOKEN = getAccessToken(country);
  tryGtag({consent: "denied", step: "default"})
  try {
    privacyBanner.loadBanner({
      storefrontAccessToken: SF_API_TOKEN,
      checkoutRootDomain: CHECKOUT_DOMAIN,
      storefrontRootDomain: STOREFRONT_DOMAIN,
    });
    document.addEventListener("visitorConsentCollected", (event) => {
      const eventDetail = event.detail;
      if (eventDetail.analyticsAllowed && eventDetail.thirdPartyMarketingAllowed && eventDetail.saleOfDataAllowed) {
        tryFbq("grant");
        tryGtag({consent: "granted", step: "update"})
      } else {
        tryFbq("revoke");
        tryGtag({consent: "denied", step: "update"})
      }
    });
  } catch (err) {
    console.warn("Error on cookie banner.", err);
  }
};

export default handleCookieBanner;
export { tryFbq };
