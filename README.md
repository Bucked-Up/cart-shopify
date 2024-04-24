# Scripts for handling shopify api calls.

## How to put into instapage

### 1. Place this code into html/css head, change primary and secondary as needed.

```
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
  const getCdnScript = () =>{
    const cdnScript = document.createElement("script");
    cdnScript.type = "module";
    const currentTime = Math.floor(+new Date() / (60 * 60 * 1000))
    cdnScript.src = `https://cdn.jsdelivr.net/gh/Bucked-Up/cart-shopify@1/src/js/scripts.js?t=${currentTime}`
    document.body.appendChild(cdnScript)
  }
  getCdnScript();
</script>
<script>
  shopifyApiCode({
    country: "us",
    dataLayer: {
      step_count: "",
      page_id: "",
      version_id: "",
    },
    products: {
      999: {},
      998: {},
    },
    bump: {
      products: {
        999: {},
        998: {},
      },
      price: 9.99,
      discountCode: "testBump",
    },
    buttons: {
      "BTN-1": {},
      "BTN-2": {},
    },
    discountCode: "test",
  });
</script>
```

You can add more than one discountCode by using "-".

ex: "code1-code2"

You can use a discount param on the url instead of the discountCode.

You can have a increse orderBump that changes the qtty of the products in the card.

```
  bump: {
    products: {
      "increase": {quantity: 2, title: "test", image: "https://"},
    },
    price: 9.99,
    discountCode: "testBump",
  },
```

product can have the following boolean properties:
- oneCard
- isWhole

You can add a title property to a product.

You can add a quantity property to a product.

You can add a hasQtty property to the bump, as well as the cart itself.

you can add a variants property to a product.

```
products: {
  999: {variants: [9998,9997]},
},
```

You can add how much you want from the product depending on the button, the discountCode and the products you want from the specific button. Ex:
```
buttons: {
  "BTN-1": {
    products: {
      999: {quantity: 3},
      998: {},
    },
    discountCode: "test",
  },
  "BTN-2": {},
},
```

## How to compile scss

### either install the compiler from the sass website, or install the vscode extension live sass compiler.


