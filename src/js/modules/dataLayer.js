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

export { dataLayerStart, dataLayerRedirect };
