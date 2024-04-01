# Scripts for handling shopify api calls with cart

## How to put into instapage

### 1. Place this code into html/css head, change primary and secondary as needed.

```
<style>
  :root{
    --primary: #0038FF;
    --secondary: #E3F5FF;
    --text-color: black;
  }
</style>
<script>
  const getCdnStyle = () =>{
    const cdnStyle = document.createElement("link");
    cdnStyle.rel = "stylesheet";
    const currentTime = Math.floor(+new Date() / (60 * 60 * 1000))
    cdnStyle.href = `https://cdn.jsdelivr.net/gh/Bucked-Up/cart-shopify@1/src/scss/style.css?t=${currentTime}`
    document.head.appendChild(cdnStyle)
  }
  getCdnStyle();
</script>
```

### 2. Place this code and change as necessary into html/css footer

```
<script>
  const step_count = "";
  const page_id = "";
  const version_id = "";

  const hasQtty = false;
  const country = "us";

  const productsID = [999,999];
  const orderBumpIds = { 999: { price: 4.99, discountCode: "test1" } };
  const buyButtonsIds = ["#element-"];
  const discountCode = "";

  //stop here.
  const urlParams = new URLSearchParams(window.location.search);
  const origin = window.location.pathname.replace("/", "").replace("/", "");
  const cookieConfig = "path=/; domain=.buckedup.com;max-age=3600";
  document.cookie = `offer_id=${discountCode};${cookieConfig}`;
  document.cookie = `page_id=${page_id};${cookieConfig}`;
  urlParams.forEach((value, key) => {
    document.cookie = `${key}=${value};${cookieConfig}`;
  });
  localStorage.setItem("first_page", origin);
  const getCdnScript = () =>{
    const cdnScript = document.createElement("script");
    cdnScript.type = "module";
    const currentTime = Math.floor(+new Date() / (60 * 60 * 1000))
    cdnScript.src = `https://cdn.jsdelivr.net/gh/Bucked-Up/cart-shopify@1/src/js/scripts.js?t=${currentTime}`
    document.body.appendChild(cdnScript)
  }
  getCdnScript();
</script>
```

You can add more than one discountCode by using "-".
ex: "code1-code2"
You can use a discount param on the url instead of the discountCode.

You can have a increse orderBump that changes the qtty of the products in the card.

```
const orderBumpIds = { increase: { price: 9.99, discountCode: "test1", quantity: 2, title: "test", discart: [999,998], image: "https://" } };
```

You can add a title property to a product in orderBumpIds.
You can add a inTop property to a product in orderBumpIds.
You can add a hasQtty property to a product in orderBumpIds, and its value can he true false or any number.

You can specify the variants you want from a product (or variant) by typing "id-variantId", and if every variant should go to the checkout using "whole"
ex:

```
const productsID = ["999-877","999-877-858",""999-877-858-whole""];
```

You can also add a oneCard property like that.

You can add how much you want from the product depending on the button, the discountCode and the products you want from the specific button. Ex:

```
const buyButtonsIds = [
  {
    id: "#BTN-1",
    products: '{"999": {"quantity": 1},"998": {"quantity": 1}}',
    discountCode: "code1",
  },
  {
    id: "#BTN-2",
    products: '{"997": {"quantity": 2},"996": {"quantity": 1}}',
    discountCode: "code2",
  },
  {
    id: "#BTN-3",
    products: '{"999": {"quantity": 1}, "998": {"quantity": 4},"997": {"quantity": 1}, "996": {"quantity": 1}}',
    discountCode: "code3",
  },
];
```

## How to compile scss

### either install the compiler from the sass website, or install the vscode extension live sass compiler.
