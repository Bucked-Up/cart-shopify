const step_count = "";
const page_id = "";
const version_id = "";
const urlParamsCookies = ["click_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

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
const cookieConfig = "path=/; domain=.buckedup.com;max-age=3600";
document.cookie = `offer_id=${discountCode};${cookieConfig}`;
document.cookie = `page_id=${page_id};${cookieConfig}`;
urlParamsCookies.forEach((param) => {
  document.cookie = `${param}=${urlParams.get(param)};${cookieConfig}`;
});
localStorage.setItem("first_page", origin);
