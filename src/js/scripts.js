import fetchProduct from "./modules/handleProduct/fetchProduct.js";
import toggleLoading from "./modules/toggleLoading.js";
import { dataLayerStart } from "./modules/dataLayer.js";
import { createCart } from "./modules/handleCart.js";
import buy from "./modules/buy.js";
import fetchProductBen from "./modules/handleProduct/fetchProductBen.js";
import handleCookieBanner, { tryFbq } from "./modules/handleCookieBanner.js";
import { handleError, trySentry } from "./variables.js";

const shopifyApiCode = async (lpParams) => {
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      document.body.classList.remove("loading");
    }
  });
  const noStock = (el) => !el.availableForSale;
  const dontExist = (btn) => !btn;
  toggleLoading();
  const isBenSys = "isBenSys" in lpParams;
  if (lpParams.country === "uk") handleCookieBanner({ country: lpParams.country });
  else tryFbq("grant");
  let data, orderBumpData;
  try {
    [data, orderBumpData] = isBenSys
      ? await Promise.all([
          fetchProductBen({ products: lpParams.products, country: lpParams.country }),
          lpParams.bump && fetchProductBen({ products: lpParams.bump.products, isOrderBump: true, country: lpParams.country }),
        ])
      : await Promise.all([
          fetchProduct({ products: lpParams.products, country: lpParams.country }),
          lpParams.bump && fetchProduct({ products: lpParams.bump.products, isOrderBump: true, country: lpParams.country }),
        ]);
  } catch (e) {
    trySentry({error: e})
    handleError();
    return;
  }
  if (data.some(noStock)) {
    handleError();
    return;
  }
  dataLayerStart(lpParams.dataLayer, data, lpParams.discountCode);
  const buttons = Object.keys(lpParams.buttons).map((id) => document.getElementById(id));
  if (buttons.some(dontExist)) {
    trySentry({message: "Wrong button id."})
    handleError();
    return;
  }
  const handleBtnNoCart = (btn) => {
    btn.addEventListener("click", () => {
      let btnData;
      const btnProducts = lpParams.buttons[btn.id].products;
      const filteredData = btnProducts ? data.filter((prod) => prod.id in btnProducts) : data;
      filteredData.forEach((prod) => (prod.quantity = (btnProducts && btnProducts[prod.id].quantity) || lpParams.products[prod.id].quantity || 1));
      btnData = filteredData;
      buy({data: btnData, btnDiscount: lpParams.buttons[btn.id].discountCode, lpParams, noCart: true});
    });
  };
  if (lpParams.noCart) {
    buttons.forEach(handleBtnNoCart);
  } else {
    const updateCartProducts = createCart(data, orderBumpData?.some(noStock) && orderBumpData[0] !== "increase" ? undefined : orderBumpData, lpParams);
    buttons.forEach((btn) => {
      if (lpParams.buttons[btn.id].noCart) {
        handleBtnNoCart(btn);
        return;
      }
      btn.addEventListener("click", () => {
        let btnData;
        const btnProducts = lpParams.buttons[btn.id].products;
        const increasedData = [];
        data.forEach((prod) => {
          if ((btnProducts && prod.id in btnProducts) || !btnProducts) {
            increasedData.push(prod);
          }
          const quantity = (btnProducts && btnProducts[prod.id]?.quantity) || lpParams.products[prod.id].quantity;
          if (quantity > 1 && !prod.isWhole && prod.variants?.length > 1 && ((btnProducts && prod.id in btnProducts) || !btnProducts)) {
            for (let i = 1; i < quantity; i++) {
              const copy = { ...prod, id: `${prod.id}id${i}` };
              increasedData.push(copy);
            }
          }
        });
        btnData = increasedData;
        updateCartProducts(btnData, lpParams.buttons[btn.id].discountCode, btnProducts, lpParams);
      });
    });
  }
  toggleLoading();
};

export default shopifyApiCode;
