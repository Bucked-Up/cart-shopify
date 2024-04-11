const step_count = "";
const page_id = "";
const version_id = "";

const hasQtty = true;
const country = "us";

const productsID = [9037941342514,9123402547506,8685143195954];
const orderBumpIds = {8858113868082: {price: 4.95, discountCode: "KSUPGRADE"}};
const buyButtonsIds = ["#BTN-1"]
const discountCode = "kssrfb1";

//stop here.
const urlParams = new URLSearchParams(window.location.search);
const origin = window.location.pathname.replace("/", "").replace("/", "");
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
document.cookie = `offer_id=${discountCode};${cookieConfig}`;
document.cookie = `page_id=${page_id};${cookieConfig}`;
urlParams.forEach((value, key) => {
  document.cookie = `${key}=${value};${cookieConfig}`;
});
localStorage.setItem("first_page", origin);
