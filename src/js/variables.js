const getAccessToken = () => {
  try {
    switch (country) {
      case "ca":
        return "3461c5b0c16a619e59715ef4d3b64731";
      default:
        return "3f0fe03b9adb374eee07d99b57da77bd";
    }
  } catch {
    return "3f0fe03b9adb374eee07d99b57da77bd";
  }
};

const getFetchUrl = () => {
  try {
    switch (country) {
      case "ca":
        return "https://cad.buckedup.com/api/2021-07/graphql.json";
      default:
        return "https://secure.buckedup.com/api/2021-07/graphql.json";
    }
  } catch {
    return "https://secure.buckedup.com/api/2021-07/graphql.json";
  }
};

const storefrontAccessToken = getAccessToken();
const fetchUrl = getFetchUrl();
const apiOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
  },
};

export { apiOptions, fetchUrl };
