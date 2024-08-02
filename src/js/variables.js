const getAccessToken = (country) => {
  switch (country) {
    case "ca":
      return "3461c5b0c16a619e59715ef4d3b64731";
    case "au":
      return "eea8ddd81a7096b8ce5e04a33234ca39";
    case "uk":
      return "d74f7d27c6deb652e0c7257e91024c87";
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
    case "uk":
      return "https://gbp.buckedup.com/api/2021-07/graphql.json";
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

const getBenProducts = async ({ ids, country }) => {
  let fetchUrl = "https://ar5vgv5qw5.execute-api.us-east-1.amazonaws.com/list/";
  const fetchApi = async (id) => {
    let url = `${fetchUrl}${id}`;
    if (country && country !== "us") url = url + `?country=${country}`;
    try {
      const response = await fetch(url);
      if (response.status === 404) throw new Error("Product Not Found.");
      if (response.status == 500 || response.status == 400) throw new Error("Sorry, there was a problem.");
      const data = await response.json();
      return data;
    } catch (error) {
      alert("Product not found.");
      return Promise.reject(error);
    }
  };
  const data = await Promise.all(ids.map(fetchApi));
  return data.map((data) => data.product);
};

export { handleFetch, getBenProducts };
