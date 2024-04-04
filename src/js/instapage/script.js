const step_count = "";
const page_id = "";
const version_id = "";

const hasQtty = false;
const country = "us";

const productsID = [8796403040562, 8796403138866, 8796403204402, 8858111377714];
const orderBumpIds = {
  increase: {
    price: 9.99,
    discountCode: "test1",
    quantity: 2,
    title: "test",
    discart: [8858111377714],
    image: "https://cdn.shopify.com/s/files/1/0817/9941/4066/files/imgpsh_fullsize_anim_6.png?v=1696351807",
  },
};
const buyButtonsIds = ["#BTN-1"];
const discountCode = "test2";

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
