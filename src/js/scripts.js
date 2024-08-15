import fetchProduct from "./modules/handleProduct/fetchProduct.js";
import toggleLoading from "./modules/toggleLoading.js";
import { dataLayerStart } from "./modules/dataLayer.js";
import { createCart } from "./modules/handleCart.js";
import buy from "./modules/buy.js";
import fetchProductBen from "./modules/handleProduct/fetchProductBen.js";
import handleCookieBanner, { tryFbq } from "./modules/handleCookieBanner.js";
import handleOnPageProducts from "./modules/handleOnPageProducts.js";

const shopifyApiCode = async (lpParams) => {
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      document.body.classList.remove("loading");
    }
  });
  toggleLoading();

  const isBenSys = "isBenSys" in lpParams;

  if (lpParams.country === "uk") handleCookieBanner({ country: lpParams.country });
  else tryFbq("grant");

  const [data, orderBumpData] = isBenSys
    ? await Promise.all([
        fetchProductBen({ products: lpParams.products, country: lpParams.country }),
        lpParams.bump && fetchProductBen({ products: lpParams.bump.products, isOrderBump: true, country: lpParams.country }),
      ])
    : await Promise.all([
        fetchProduct({ products: lpParams.products, country: lpParams.country }),
        lpParams.bump && fetchProduct({ products: lpParams.bump.products, isOrderBump: true, country: lpParams.country }),
      ]);

  const noStock = (el) => !el.availableForSale;
  if (data.some(noStock)) {
    alert("Product not found.");
    window.location.href = "https://buckedup.com";
    return;
  }

  dataLayerStart(lpParams.dataLayer, data, lpParams.discountCode);

  const buttons = Object.keys(lpParams.buttons).map((id) => document.getElementById(id));

  const getQuantity = (btnProducts, prod) => (prod.isCopy ? 1 : (btnProducts && btnProducts[prod.id]?.quantity) || lpParams.products[prod.id].quantity || 1);
  const increaseProduct = (prod, quantity, array) => {
    const index = array.indexOf(prod);
    for (let i = 1; i < quantity; i++) {
      const copy = { ...prod, id: prod.id.includes("id") ? `${prod.id}${i}` : `${prod.id}id${i}`, isCopy: true };
      array.splice(index + 1, 0, copy);
    }
  };

  const handleBtnNoCart = (btn) => {
    const btnProducts = lpParams.buttons[btn.id].products;
    const filteredData = btnProducts ? data.filter((prod) => prod.id in btnProducts).map((prod) => ({ ...prod })) : data;
    for (let i = 0; i < filteredData.length; i++) {
      const prod = filteredData[i];
      if (prod.onPageSelect && !prod.isCopy) {
        prod.quantity = 1;
        const quantity = getQuantity(btnProducts, prod);
        prod.id = prod.id + `id${btn.id}`;
        if (quantity > 1) increaseProduct(prod, quantity, filteredData, btn.id);
      } else {
        prod.quantity = getQuantity(btnProducts, prod);
      }
    }
    handleOnPageProducts(filteredData, btn.id, lpParams);
    btn.addEventListener("click", () => {
      buy({
        data: filteredData,
        btnDiscount: lpParams.buttons[btn.id].discountCode,
        lpParams,
        noCart: true,
        btnId: btn.id,
      });
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
        for (let i = 0; i < data.length; i++) {
          const prod = data[i];
          if ((btnProducts && prod.id in btnProducts) || !btnProducts) {
            increasedData.push(prod);
          }
          const quantity = getQuantity(btnProducts, prod);
          if (quantity > 1 && !prod.isCopy && !prod.isWhole && prod.variants?.length > 1 && ((btnProducts && prod.id in btnProducts) || !btnProducts)) {
            increaseProduct(prod, quantity, increasedData);
          }
        }
        btnData = increasedData;
        updateCartProducts(btnData, lpParams.buttons[btn.id].discountCode, btnProducts, lpParams);
      });
    });
  }
  toggleLoading();
};

export default shopifyApiCode;
