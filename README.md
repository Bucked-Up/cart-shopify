# Scripts for handling shopify api calls.

## How to put into instapage

### 1. Place this code into html/css head, change primary and secondary as needed.

```
<script>
  document.head.appendChild(Object.assign(document.createElement("link"), {
    rel: "stylesheet",
    href: `https://cdn.jsdelivr.net/gh/Bucked-Up/cart-shopify@2/src/scss/style.css?t=${Math.floor(Date.now()/3600000)}`
  }));
</script>
```

## 1.1 If it needs cookie banner, place this as well:

```
<script src="https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js?shpxid=35f6923e-D6D6-4F06-1E1C-CDEB0AF3238C"></script>
<script src="https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js?shpxid=35f6923e-D6D6-4F06-1E1C-CDEB0AF3238C"></script>

```

### 2. Place this code and change as necessary into html/css footer

```
<script type="module">
  const handleShopifyApi = async () => {
    const { default: shopifyApiCode } = await import(`https://cdn.jsdelivr.net/gh/Bucked-Up/cart-shopify@2/src/js/scripts.js?t=${Math.floor(Date.now() / 3600000)}`);
    shopifyApiCode({
      noCart: false,
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
  }
  handleShopifyApi();
</script>
```

You can use the Ecomm instead of shopify by adding "isBenSys: {},".

SHOPIFY You can add more than one discountCode by using "-".

ex: "code1-code2"

You can use a discount param on the url instead of the discountCode.

SHOPIFY (needs to see how to add multiple discontCodes on the ecomm) You can have a increse orderBump that changes the qtty of the products in the card.

```
  bump: {
    products: {
      "increase": {quantity: 2, title: "test", image: "https://", discart: [999,998]},
    },
    price: 9.99,
    discountCode: "testBump",
  },
```

You can have more than one bump product.

```
bump: {
  products: {
    999: { title: "Get 30 Servings of Babe Greens & Free Shipping On Your Order!",  price: 9.99 },
    999: { title: "Get 30 Servings of Babe Collagen & Free Shipping On Your Order!", discountCode: "lorem"}
  },
  price: 39.99,
  discountCode: "ipsum",
},
```

product can have the following boolean properties:

- oneCard
- isWhole

If it has both, it will need image and title as well.

You can add a title property to a product.

You can add a quantity property to a product.

You can add a hasQtty property to the bump, as well as the cart itself.

SHOPIFY You can add a variantOf property to a product.

SHOPIFY You can add a noPriceUp property to a product.

You can add a variants property to a product.

```
products: {
  999: {variants: [9998,9997]},
},
```

Products can have variantsOptions.

```
variantsOptions: {
  9998: { quantity: 5 }
}
```

You can add a noCart option to a button.

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
