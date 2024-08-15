import { handleSimpleProduct } from "./handleCart.js";

const handleOnPageProducts = (data, btnId, lpParams) => {
  data.forEach((prod) => {
    if (!prod.onPageSelect) return;
    const wrapperId = prod.onPageSelect.wrappers[btnId];
    const wrapper = document.getElementById(wrapperId);
    handleSimpleProduct({ prod, productInfo: wrapper, title: lpParams.products[prod.id.split("id")[0]].title });
  });
};

export default handleOnPageProducts;
