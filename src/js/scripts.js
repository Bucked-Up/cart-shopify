import fetchProduct from "./modules/handleProduct/fetchProduct.js";
import toggleLoading from "./modules/toggleLoading.js";
import { dataLayerStart } from "./modules/dataLayer.js";
import { createCart } from "./modules/handleCart.js";

const shopifyApiCode = async (lpParams) => {
  toggleLoading();
  const [data, orderBumpData] = await Promise.all([
    fetchProduct({ products: lpParams.products, country: lpParams.country }),
    fetchProduct({ products: lpParams.bump.products, isOrderBump: true, country: lpParams.country }),
  ]);
  dataLayerStart(lpParams.dataLayer, data, lpParams.discountCode);
  const noStock = (el) => !el.availableForSale;
  if (data.some(noStock)) {
    alert("Product not found.");
    window.location.href = "https://buckedup.com";
    return;
  }
  const updateCartProducts = createCart(data, orderBumpData, lpParams);
  const buttons = Object.keys(lpParams.buttons).map((id) => document.getElementById(id));
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      let btnData;
      const btnProducts = lpParams.buttons[btn.id].products;
      const increasedData = [];
      data.forEach((prod) => {
        if ((btnProducts && prod.id in btnProducts) || !btnProducts) {
          increasedData.push(prod);
        }
        const quantity = (btnProducts && btnProducts[prod.id]?.quantity) || lpParams.products[prod.id].quantity
        if (quantity > 1 && !prod.isWhole && prod.variants?.length > 1 && ((btnProducts && prod.id in btnProducts) || !btnProducts)) {
          for (let i = 1; i < quantity; i++) {
            const copy = { ...prod, id: `${prod.id}id${i}` };
            increasedData.push(copy);
          }
        }
      });
      btnData = increasedData;
      if (!btn.hasAttribute("disabled")) {
        updateCartProducts(btnData, lpParams.buttons[btn.id].discountCode, btnProducts, lpParams);
      }
    });
  });
  toggleLoading();
};

shopifyApiCode({
  dataLayer: {
    step_count: "test",
    page_id: "test2",
    version_id: "test3",
  },
  hasQtty: false,
  country: "us",
  products: {
    9037941342514: {},
    9123402547506: {title: "test"},
    8685143195954: {},
  },
  bump: {
    products: {
      8685147062578: { title: "First, choose your Perfect Shaker Bottle" },
      8685143195954: {},
    },
    price: 9.99,
    discountCode: "KSUPGRADE",
    hasQtty: false,
  },
  bumpAtTop: false,
  buttons: {
    "BTN-1": {
      products: {
        9037941342514: {},
        9123402547506: {},
        8685143195954: {},
      },
    },
  },
  discountCode: "kssrfb1",
});
