import fetchProduct from "./modules/handleProduct/fetchProduct.js";
import toggleLoading from "./modules/toggleLoading.js";
import { dataLayerStart } from "./modules/dataLayer.js";
import { createCart } from "./modules/handleCart.js";

const buyButtons = [];
buyButtonsIds.forEach((id) => {
  let buyButton;
  if (typeof id !== "string") {
    buyButton = document.querySelector(id.id);
    id.products && buyButton.setAttribute("products", id.products);
    id.discountCode && buyButton.setAttribute("discountCode", id.discountCode);
  } else buyButton = document.querySelector(id);
  buyButtons.push(buyButton);
});

const main = async () => {
  toggleLoading();
  const [data, orderBumpData] = await Promise.all([fetchProduct({ ids: productsID }), fetchProduct({ ids: Object.keys(orderBumpIds), isOrderBump: true })]);
  dataLayerStart(data);
  const noStock = (el) => !el.availableForSale;
  if (data.some(noStock)) {
    alert("Product not found.");
    window.location.href = "https://buckedup.com";
    return;
  }
  const updateCartProducts = createCart(data, orderBumpData);
  buyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      let btnData;
      const btnProducts = JSON.parse(btn.getAttribute("products"));
      if (btnProducts) {
        const filteredData = data.filter((prod) => prod.id in btnProducts);
        const increasedData = [];
        filteredData.forEach((prod) => {
          increasedData.push(prod);
          const quantity = btnProducts[prod.id].quantity;
          if (quantity > 1 && !prod.isWhole && prod.variants?.length > 1) {
            for (let i = 1; i < quantity; i++) {
              const copy = { ...prod, id: `${prod.id}id${i}` };
              increasedData.push(copy);
            }
          }
        });
        btnData = increasedData;
      } else btnData = data;
      if (!btn.hasAttribute("disabled")) {
        updateCartProducts(btnData, btn.getAttribute("discountCode"), btnProducts);
      }
    });
  });
  toggleLoading();
};

main();
