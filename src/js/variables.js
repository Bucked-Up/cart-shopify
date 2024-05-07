const getAccessToken = (country) => {
  switch (country) {
    case "ca":
      return "3461c5b0c16a619e59715ef4d3b64731";
    case "au":
      return "eea8ddd81a7096b8ce5e04a33234ca39";
    default:
      return "3f0fe03b9adb374eee07d99b57da77bd";
  }
};

const getFetchUrl = (country) => {
  switch (country) {
    case "ca":
      return "https://cad.buckedup.com/api/2021-07/graphql.json";
    case "au":
      return "https://aud.buckedup.com/api/2021-07/graphql.json";
    default:
      return "https://secure.buckedup.com/api/2021-07/graphql.json";
  }
};

const getApiOptions = (country) => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": getAccessToken(country),
    },
  };
};

const handleFetch = async ({ body, country }) => {
  const response = await fetch(getFetchUrl(country), {
    ...getApiOptions(country),
    body: JSON.stringify(body),
  });
  return response;
};

export { handleFetch };
