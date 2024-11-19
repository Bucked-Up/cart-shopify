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

const setDataLayer = ({ lpDataLayer, event, action, value, currency }) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    ...lpDataLayer,
    event: event,
    action: action,
    value: value,
    currency: currency,
    transaction_id: undefined,
  });
};

const setKlaviyo = (name, item, titles, lpDataLayer) => {
  const currentTime = new Date();
  try {
    klaviyo.push([
      "track",
      name,
      { ...lpDataLayer, ...item, products: titles, pagepath: window.location.pathname, pageurl: window.location.href, time: currentTime.getTime() },
    ]);
  } catch (err) {
    console.warn("failed klaviyo\n", err);
  }
};

const dataLayerStart = (lpDataLayer, data, discountCode) => {
  const titles = data.map((items) => items.title);
  const item = { lpDataLayer, event: "pageview", action: "load", value: 0 };
  setDataLayer(item);

  const cookieConfig = `path=/; domain=${getTopLevelDomain()};max-age=3600`;
  document.cookie = `offer_id=${discountCode};${cookieConfig}`;
  document.cookie = `page_id=${lpDataLayer.page_id};${cookieConfig}`;

  setTimeout(() => {
    setKlaviyo("Page View", item, titles, lpDataLayer);
  }, 200);
};

const dataLayerRedirect = (lpDataLayer, data) => {
  const titles = data.map((items) => items.title);
  const item = { lpDataLayer, event: "offerview", action: "viewaction", value: 0 };
  setDataLayer(item);
  setKlaviyo("User Redirect Engagement", item, titles, lpDataLayer);
};

export { dataLayerStart, dataLayerRedirect, getTopLevelDomain };
