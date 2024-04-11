const step_count = "";
const page_id = "";
const version_id = "";

const hasQtty = true;
const country = "us";

const productsID = ["8820417003826-oneCard","9123402547506",8858111377714,"8685145588018-46753449607474-whole"];
const orderBumpIds = {increase: {price: 9.99, title: "x2", quantity: 2}};
const buyButtonsIds = [{id: "#BTN-1", products: '{"8858111377714": {"quantity": 2}, "8820417003826": {"quantity": 4}, "9123402547506": {"quantity": 2},"8685145588018": {"quantity": 3}}'}];
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
