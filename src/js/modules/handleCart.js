import buy from "./buy.js";

const addNewPrice = (toBeReplaced, newNumber) => {
  if (newNumber == 0) {
    toBeReplaced.innerHTML = "FREE";
    return;
  }
  if (/[0-9]/.test(toBeReplaced.innerHTML)) {
    toBeReplaced.innerHTML = toBeReplaced.innerHTML.replace(/[0-9.]+/, newNumber);
  } else {
    toBeReplaced.innerHTML = `$${newNumber}`;
  }
};

const observePlusPrice = (el, func) => {
  const targetNode = el;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "plus-price") {
        func();
      }
    });
  });
  observer.observe(targetNode, { attributes: true, attributeFilter: ["plus-price"] });
};

const handleCartPrice = ({ productWrapper, inCartContainer, prod }) => {
  let prevPrice = 0;
  const newPriceElement = document.querySelector(".cart__foot__new-price");
  const oldPriceElement = document.querySelector(".cart__foot__old-price");

  const handleNewPrice = ({ selected, isPlus }) => {
    const newPriceValue = +newPriceElement?.innerHTML.replace(/[^0-9.]/g, "") || 0;
    const oldPriceValue = +oldPriceElement?.innerHTML.replace(/[^0-9.]/g, "") || 0;
    if (isPlus) {
      addNewPrice(newPriceElement, (newPriceValue + selected).toFixed(2));
      addNewPrice(oldPriceElement, (oldPriceValue + selected).toFixed(2));
      return;
    }
    addNewPrice(newPriceElement, (newPriceValue - selected).toFixed(2));
    addNewPrice(oldPriceElement, (oldPriceValue - selected).toFixed(2));
  };

  const handlePriceObserver = () => {
    const currentPrice = +productWrapper.getAttribute("plus-price");
    if (prevPrice && prevPrice !== currentPrice && newPriceElement && oldPriceElement && inCartContainer.querySelector(`[prod-id='${prod.id}']`)) {
      handleNewPrice({ selected: prevPrice });
    }
    if (prevPrice !== currentPrice) {
      productWrapper.setAttribute("plus-price", currentPrice);
      prevPrice = currentPrice;
      if (newPriceElement && oldPriceElement && inCartContainer.querySelector(`[prod-id='${prod.id}']`)) {
        handleNewPrice({ selected: currentPrice, isPlus: true });
      }
    }
  };

  observePlusPrice(productWrapper, handlePriceObserver);
};

const createInputRadio = ({ productId, variantId, text, variantPrice = "", plusPrice = false, variantPlusPrice, isPlaceholder }) => {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const labelText = document.createElement("span");
  const input = document.createElement("input");
  wrapper.appendChild(input);
  wrapper.appendChild(label);
  const labelBall = document.createElement("span");
  labelBall.classList.add("label-ball");
  label.appendChild(labelBall);
  label.appendChild(labelText);

  wrapper.classList.add("button-wrapper");
  labelText.classList.add("label-text");
  label.setAttribute("for", `${productId}-${variantId}`);
  label.setAttribute("role", "button");
  labelText.innerHTML = text;
  input.id = `${productId}-${variantId}`;
  input.value = `${variantId}`;
  input.type = "radio";
  input.setAttribute("hidden", "");

  input.name = productId;
  input.setAttribute("price", variantPrice);
  input.setAttribute("plus-price", variantPlusPrice || 0);
  input.setAttribute("label-text", text);

  if (plusPrice) {
    const labelPrice = document.createElement("span");
    labelPrice.classList.add("label-price");
    labelPrice.innerHTML = ` (${plusPrice})`;
    labelText.appendChild(labelPrice);
  }

  if (isPlaceholder) input.setAttribute("disabled", "disabled");

  return [wrapper, input];
};

const createButton = (variant) => {
  const button = document.createElement("button");
  button.type = "button";
  button.value = variant.id;
  button.classList.add("cart__variant-button");
  const title = document.createElement("span");
  title.innerHTML = variant.title;
  const img = document.createElement("img");
  img.src = variant.image.src;
  img.alt = variant.title;
  button.appendChild(title);
  button.appendChild(img);
  return button;
};

const createDropdown = (title) => {
  const dropdown = document.createElement("div");
  const p = document.createElement("p");
  const svg = '<svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5981 15.5C11.4434 17.5 8.55662 17.5 7.40192 15.5L1.33975 5C0.185047 3 1.62842 0.499998 3.93782 0.499998L16.0622 0.499999C18.3716 0.5 19.815 3 18.6603 5L12.5981 15.5Z" fill="black"/></svg>';
  dropdown.setAttribute("role", "button");
  dropdown.classList.add("cart__dropdown");
  p.innerHTML = title;
  dropdown.appendChild(p);
  dropdown.insertAdjacentHTML("beforeend", svg);
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.remove("shake");
    if (e.target.tagName !== "INPUT") dropdown.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) || e.target.tagName === "INPUT") dropdown.classList.remove("active");
  });
  return dropdown;
};

const createProductBase = ({ prod, img, productWrapper }) => {
  const variantsWrapper = document.createElement("div");
  const dropdown = createDropdown(prod.variants[0].title);
  variantsWrapper.classList.add("cart__dropdown__variants");
  prod.placeholderVariants?.forEach(placeHolder=>{
    prod.notAvailableVariants.push({
      id: "placeholder",
      title: placeHolder.title,
      availableForSale: false,
    })
  });
  [...prod.variants, ...prod.notAvailableVariants].forEach((variant) => {
    const [wrapper, button] = createInputRadio({
      isPlaceholder: !variant.availableForSale,
      productId: prod.id,
      variantId: variant.id,
      text: variant.title,
      variantPrice: variant.price?.amount,
      variantPlusPrice: variant.plusPrice,
    });
    variantsWrapper.appendChild(wrapper);
    variantsWrapper.querySelector("input").checked = true;
    button.addEventListener("change", function () {
      img.src = variant.image.src;
      img.alt = variant.title;
      dropdown.querySelector("p").innerHTML = button.getAttribute("label-text");
      productWrapper && productWrapper.setAttribute("plus-price", this.getAttribute("plus-price"));
    });
  });
  dropdown.appendChild(variantsWrapper);
  return dropdown;
};

const handleSimpleProduct = ({ prod, productInfo, img, productWrapper }) => {
  const dropdown = createProductBase({ prod, img, productWrapper });
  productInfo.appendChild(dropdown);
};

const handleOptionalProduct = ({ prod }) => {
  const img = document.querySelector(`[optional-prod-img="${prod.id}"]`);
  img.src = prod.variants[0].image.src;
  const selectorWrapper = document.querySelector(`[optional-prod-selector-wrapper="${prod.id}"]`);

  const dropdown = createProductBase({ prod, img });
  selectorWrapper.appendChild(dropdown);
};

const handleComplexProduct = ({ prod, productInfo, img, productWrapper }) => {
  const primaryOption = prod.options[0];
  const secondaryOption = prod.options[1];
  primaryOption.notAvailableValues = primaryOption.values.filter((value) => {
    for (let variant of [...prod.variants, ...prod.notAvailableVariants]) {
      if (variant.selectedOptions[0].value === value && variant.availableForSale) return false;
    }
    return true;
  });
  primaryOption.values = primaryOption.values.filter((value) => {
    for (let variant of prod.variants) {
      if (variant.selectedOptions[0].value === value && variant.availableForSale) return true;
    }
    return false;
  });

  const initialVariant = prod.variants.find((variant) => variant.title.includes(primaryOption.values[0]));
  img.src = initialVariant.image.src;
  img.alt = initialVariant.title;

  const createBase = (text) => {
    const dropdown = createDropdown(text);
    const variantsWrapper = document.createElement("div");
    variantsWrapper.classList.add("cart__dropdown__variants");
    return [dropdown, variantsWrapper];
  };

  const [primaryDropdown, primaryVariantsWrapper] = createBase(primaryOption.values[0]);
  const secondaryVariantsWrapper = document.createElement("div");
  secondaryVariantsWrapper.classList.add("cart__secondary-wrapper");
  primaryVariantsWrapper.setAttribute("primary", prod.id);
  secondaryVariantsWrapper.setAttribute("secondary", prod.id);

  const findPlusPrice = (value, variants) => {
    for (let variant of variants) {
      if (variant.title.includes(value)) return variant.title.split("(")[1]?.split(")")[0];
    }
  };

  const getNewName = (value) => {
    switch (value) {
      case "Small":
        return "S";
      case "Medium":
        return "M";
      case "Large":
        return "L";
      case "X-Large":
        return "XL";
      default:
        return value;
    }
  };

  const placeHolders = ["S", "M", "L", "XL", "2XL", "3XL"].map((size) => {
    const wrapper = document.createElement("div");
    const textWrapper = document.createElement("div");
    const text = document.createElement("span");
    wrapper.classList.add("button-wrapper");
    wrapper.classList.add("button-wrapper--placeholder");
    textWrapper.classList.add("placeholder__text-wrapper");
    text.classList.add("label-text");
    text.innerHTML = size;
    text.setAttribute("size", size);
    wrapper.appendChild(textWrapper);
    textWrapper.appendChild(text);
    return wrapper;
  });

  const updateSecondaryOptions = (primarySelected) => {
    const prevSelected = secondaryVariantsWrapper.querySelector(["input:checked"]);
    secondaryVariantsWrapper.innerHTML = "";
    productWrapper.setAttribute("plus-price", 0);
    placeHolders.forEach((placeholder) => secondaryVariantsWrapper.appendChild(placeholder));
    prod.variants.forEach((variant) => {
      const newValue = variant.selectedOptions[1].value;
      const plusPrice = findPlusPrice(newValue, prod.variants);
      if (variant.title.includes(primarySelected) && !secondaryVariantsWrapper.querySelector("label")?.innerHTML.includes(newValue)) {
        const [wrapper, button] = createInputRadio({
          productId: secondaryOption.id,
          variantId: newValue,
          text: getNewName(newValue),
          plusPrice: plusPrice,
          variantPlusPrice: variant.plusPrice,
        });
        button.addEventListener("change", function () {
          productWrapper.setAttribute("plus-price", this.getAttribute("plus-price"));
          secondaryVariantsWrapper.classList.remove("shake");
        });
        if (prevSelected?.value === newValue) {
          button.checked = true;
          productWrapper.setAttribute("plus-price", button.getAttribute("plus-price"));
        }
        const placeholder = placeHolders.find((placeHolder) => placeHolder.querySelector(`[size="${getNewName(newValue)}"]`));
        secondaryVariantsWrapper.insertBefore(wrapper, placeholder);
        placeholder.remove();
      }
    });
  };

  primaryOption.values.forEach((option) => {
    const [wrapper, button] = createInputRadio({
      productId: primaryOption.id,
      variantId: option,
      text: option,
    });
    button.addEventListener("change", () => {
      for (let variant of prod.variants) {
        if (variant.title.includes(button.value)) {
          img.src = variant.image.src;
          img.alt = button.getAttribute("label-text");
          primaryDropdown.querySelector("p").innerHTML = button.getAttribute("label-text");
          break;
        }
      }
      updateSecondaryOptions(button.value);
    });
    primaryVariantsWrapper.appendChild(wrapper);
  });
  primaryOption.notAvailableValues.forEach((option) => {
    const [wrapper, button] = createInputRadio({
      isPlaceholder: true,
      productId: primaryOption.id,
      variantId: option,
      text: option,
    });
    primaryVariantsWrapper.appendChild(wrapper);
  });
  primaryVariantsWrapper.querySelector("input").checked = true;
  primaryDropdown.appendChild(primaryVariantsWrapper);

  updateSecondaryOptions(primaryOption.values[0]);

  productInfo.appendChild(primaryDropdown);
  productInfo.appendChild(secondaryVariantsWrapper);
};

const createQtty = ({ inputId, maxQtty, addButton, price }) => {
  const updateTitle = (qtty) => {
    if (price) {
      const separetedString = addButton.innerHTML.split("$");
      separetedString[1] = (price * qtty).toFixed(2);
      addButton.innerHTML = separetedString.join("$");
    }
  };

  const plusBtn = document.createElement("button");
  plusBtn.classList.add("btn-plus");
  plusBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>';

  const minusBtn = document.createElement("button");
  minusBtn.classList.add("btn-minus");
  minusBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-440v-80h560v80H200Z"/></svg>';

  const qttyInput = document.createElement("input");
  qttyInput.id = inputId || "cart-qtty-input";
  qttyInput.value = 1;
  qttyInput.type = "number";
  qttyInput.addEventListener("input", () => {
    if (qttyInput.value <= 0) {
      qttyInput.value = 1;
      updateTitle(qttyInput.value);
    }
    if (maxQtty && qttyInput.value > maxQtty) {
      qttyInput.value = maxQtty;
      updateTitle(qttyInput.value);
    }
  });

  plusBtn.addEventListener("click", () => {
    if (!maxQtty || qttyInput.value < maxQtty) {
      qttyInput.value = +qttyInput.value + 1;
      updateTitle(qttyInput.value);
    }
  });
  minusBtn.addEventListener("click", () => {
    if (qttyInput.value > 1) {
      qttyInput.value = +qttyInput.value - 1;
      updateTitle(qttyInput.value);
    }
  });

  const qttyWrapper = document.createElement("div");
  qttyWrapper.classList.add("qtty-wrapper");
  qttyWrapper.appendChild(minusBtn);
  qttyWrapper.appendChild(qttyInput);
  qttyWrapper.appendChild(plusBtn);
  return [qttyWrapper, qttyInput];
};

const increasePlaceholders = (prodWrapper) => {
  const placeHoldersDiv = prodWrapper.querySelector(".cart__placeholders");
  const placeHolder = placeHoldersDiv.querySelector(".cart__variant-placeholder");
  placeHoldersDiv.appendChild(placeHolder.cloneNode(true));
};

const handleOneCardProduct = ({ productInfo }) => {
  const placeHoldersDiv = document.createElement("div");
  placeHoldersDiv.classList.add("cart__placeholders");
  const placeHolder = document.createElement("div");
  placeHolder.classList.add("cart__variant-placeholder");
  const title = document.createElement("p");
  title.innerHTML = "Your Choice";
  const img = document.createElement("div");
  placeHolder.appendChild(title);
  placeHolder.appendChild(img);
  placeHoldersDiv.appendChild(placeHolder);
  productInfo.appendChild(placeHoldersDiv);
};

const createPlaceholders = ({ prod, selectionDiv, productWrapper }) => {
  selectionDiv = document.createElement("div");
  selectionDiv.classList.add("cart__variant-selection");
  const title = document.createElement("p");
  title.innerHTML = `Select your variants: `;
  selectionDiv.appendChild(title);
  const selectionContainer = document.createElement("div");
  selectionContainer.classList.add("cart__variant-selection__container");
  selectionDiv.appendChild(selectionContainer);
  prod.placeholderVariants?.forEach(placeHolder=>{
    prod.notAvailableVariants.push({
      id: "placeholder",
      title: placeHolder.title,
      availableForSale: false,
      image: {src: placeHolder.image},
    })
  });
  [...prod.variants, ...prod.notAvailableVariants].forEach((variant) => {
    const btn = createButton(variant);
    selectionContainer.appendChild(btn);
    if (!variant.availableForSale) btn.setAttribute("disabled", "disabled");
    else
      btn.addEventListener("click", () => {
        const prodContainer = document.querySelector(`[prod-id="${prod.id.split("id")[0]}"] .cart__placeholders`);
        if (btn.parentElement.classList.contains("cart__variant-selection__container")) {
          const placeholder = prodContainer.querySelector('.cart__variant-placeholder:not([style*="display: none"])');
          const firstChild = prodContainer.querySelector("*");
          const prevPlusPrice = +productWrapper.getAttribute("plus-price");
          productWrapper.setAttribute("plus-price", prevPlusPrice + +(variant.plusPrice || 0));
          const clone = btn.cloneNode(true);
          clone.addEventListener("click", () => {
            const prevPlusPrice = +productWrapper.getAttribute("plus-price");
            productWrapper.setAttribute("plus-price", prevPlusPrice - +(variant.plusPrice || 0));
            prodContainer.querySelector('.cart__variant-placeholder[style*="display: none"]').style.display = "";
            selectionDiv.style.display = "";
            clone.remove();
          });
          prodContainer.insertBefore(clone, firstChild);
          placeholder.style.display = "none";
          selectionContainer.classList.remove("shake");
          if (!prodContainer.querySelector('.cart__variant-placeholder:not([style*="display: none"])')) selectionDiv.style.display = "none";
        }
      });
  });
  return selectionDiv;
};

const createBumpAddButton = ({ data, container, wrapper, inCartContainer, prod, price, lpParams }) => {
  const newPriceElement = document.querySelector(".cart__foot__new-price");
  const oldPriceElement = document.querySelector(".cart__foot__old-price");

  const isIncrease = typeof prod === "string" && prod === "increase";
  const addButton = document.createElement("button");
  addButton.classList.add("add-button");
  addButton.innerHTML = `Add to cart for only +$${price.toFixed(2)}`;

  const handleAddButtonText = () => {
    if (addButton.classList.contains("bump-added")) return;
    addButton.innerHTML = `Add to cart for only +$${(price + +wrapper.getAttribute("plus-price")).toFixed(2)}`;
  };
  observePlusPrice(wrapper, handleAddButtonText);

  const getOrderBumpIncreaseProds = () => data.filter((prod) => !lpParams.bump.products["increase"].discart?.includes(+prod.id));
  addButton.addEventListener("click", () => {
    const plusPrice = wrapper.getAttribute("plus-price");
    const totalPrice = price + +plusPrice;
    const newPriceValue = +newPriceElement?.innerHTML.replace(/[^0-9.]/g, "") || 0;
    const oldPriceValue = +oldPriceElement?.innerHTML.replace(/[^0-9.]/g, "") || 0;
    if (addButton.classList.contains("bump-added")) {
      addButton.classList.remove("bump-added");
      addButton.innerHTML = `Add to cart for only +$${(price + +wrapper.getAttribute("plus-price")).toFixed(2)}`;
      container.appendChild(wrapper);
      if (isIncrease) {
        document.querySelectorAll("[bump-increase-qtty-input]").forEach((input) => input.remove());
      } else {
        data.splice(data.indexOf(prod), 1);
      }
      if (newPriceElement && oldPriceElement) {
        addNewPrice(newPriceElement, (newPriceValue - totalPrice).toFixed(2));
        addNewPrice(oldPriceElement, (oldPriceValue - totalPrice).toFixed(2));
      }
    } else {
      if (isIncrease) {
        getOrderBumpIncreaseProds().forEach((prod) => {
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.setAttribute("bump-increase-qtty-input", "");
          hiddenInput.value = lpParams.bump.products["increase"].quantity;
          hiddenInput.id = `qtty-input-${prod.id}`;
          document.body.appendChild(hiddenInput);
        });
      } else {
        data.push(prod);
      }
      addButton.classList.add("bump-added");
      addButton.innerHTML = "Added to cart";
      inCartContainer.appendChild(wrapper);
      if (newPriceElement && oldPriceElement) {
        addNewPrice(newPriceElement, (newPriceValue + totalPrice).toFixed(2));
        addNewPrice(oldPriceElement, (oldPriceValue + totalPrice).toFixed(2));
      }
    }
  });
  return addButton;
};

const createProduct = ({ prod, isVariant, isOrderBump, orderBumpsContainer, inCartContainer, quantity, lpParams, data }) => {
  let prevProdWrapper;
  const productWrapper = document.createElement("div");
  if (prod !== "increase") prevProdWrapper = document.querySelector(`[prod-id="${prod.id.split("id")[0]}"]`);
  let selectionDiv = undefined;
  if (prod.oneCard && !prod.isWhole) {
    if (prod.oneCard && !prevProdWrapper) {
      selectionDiv = createPlaceholders({
        prod,
        selectionDiv,
        productWrapper,
      });
    } else if (prod.oneCard) {
      increasePlaceholders(prevProdWrapper);
      return undefined;
    }
  }

  productWrapper.classList.add("cart__product");
  if(prod.isHidden) productWrapper.classList.add("is-hidden-product");
  if (prod !== "increase") productWrapper.setAttribute("prod-id", isVariant ? isVariant.id : prod.id.split("id")[0]);

  handleCartPrice({ productWrapper, inCartContainer, prod });

  const productContainer = document.createElement("div");
  productContainer.classList.add("cart__product__container");

  productWrapper.appendChild(productContainer);
  if (selectionDiv) productWrapper.appendChild(selectionDiv);

  const productInfo = document.createElement("div");
  productInfo.classList.add("cart__product__info");

  const title = document.createElement("p");
  title.classList.add("cart__product__title");
  title.innerHTML = isVariant?.title || prod.title || lpParams.bump.products[prod].title;
  productInfo.appendChild(title);
  if (isVariant) {
    const variantTitle = document.createElement("p");
    variantTitle.classList.add("cart__product__variant-title");
    variantTitle.innerHTML = prod.title;
    productInfo.appendChild(variantTitle);
  }

  let img = undefined;
  if (!prod.oneCard || (prod.oneCard && prod.isWhole)) {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("cart__product__img-wrapper");
    img = document.createElement("img");
    if (prod.oneCard && prod.isWhole) {
      img.src = lpParams.products[prod.id].image;
      img.alt = lpParams.products[prod.id].title;
      prod.variants.forEach((variant) => {
        const variantId = variant.id.split("ProductVariant/")[1] || variant.id.split("option")[0];
        const variantsOptions = lpParams.products[prod.id].variantsOptions;
        if (variantsOptions) {
          const variantQuantity = variantsOptions[variantId]?.quantity;
          if (variantQuantity) productWrapper.setAttribute(`variant-qtty-${variantId}`, variantQuantity);
        }
      });
    } else if (isVariant) {
      img.src = prod.image.src;
      img.alt = prod.title;
    } else {
      if (prod !== "increase") {
        img.src = prod.variants[0].image.src;
        img.alt = prod.variants[0].title;
      } else {
        img.src = lpParams.bump.products[prod].image;
      }
    }
    imgWrapper.appendChild(img);
    productContainer.appendChild(imgWrapper);
    if (quantity > 1 && (isVariant || prod.variants?.length <= 1)) {
      const quantityLabel = document.createElement("span");
      quantityLabel.id = `${isVariant?.id || prod.id}-quantity`;
      quantityLabel.innerHTML = quantity || 1;
      imgWrapper.appendChild(quantityLabel);
    }
  }

  productContainer.appendChild(productInfo);
  if (prod !== "increase" && !isVariant && prod.variants.length > 1 && !prod.isWhole) {
    if (prod.options.length > 1) handleComplexProduct({ prod, productInfo, img, productWrapper });
    else if (!prod.oneCard) handleSimpleProduct({ prod, productInfo, img, productWrapper });
    else handleOneCardProduct({ prod, productInfo, productWrapper });
  }
  if (isOrderBump) {
    const addWrapper = document.createElement("div");
    addWrapper.classList.add("add-wrapper");
    const addButton = createBumpAddButton({
      data,
      container: orderBumpsContainer,
      wrapper: productWrapper,
      inCartContainer,
      prod,
      price: lpParams.bump.products[prod.id?.split("ob")[0]]?.price || lpParams.bump.price,
      lpParams,
    });
    addWrapper.appendChild(addButton);
    let qttyWrapper;
    if (lpParams.bump.hasQtty) {
      const maxQtty = typeof lpParams.bump.hasQtty === "number" ? lpParams.bump.hasQtty : false;
      [qttyWrapper] = createQtty({ inputId: `qtty-input-${prod.id}`, maxQtty, addButton, price: lpParams.bump.price });
      addWrapper.appendChild(qttyWrapper);
    }
    productInfo.appendChild(addWrapper);
  }

  return productWrapper;
};

const createCart = (data, orderBumpData, lpParams) => {
  const domCartContainer = document.querySelector("[cart-container]") || false;
  const cartWrapper = document.createElement("div");
  const cartOverlay = document.createElement("div");
  const cart = document.createElement("div");
  cartWrapper.classList.add("cart-wrapper");
  cartOverlay.classList.add("cart-overlay");
  cart.classList.add("cart");
  if (domCartContainer) {
    domCartContainer.appendChild(cart);
  } else {
    cartWrapper.appendChild(cartOverlay);
    cartWrapper.appendChild(cart);
    document.body.appendChild(cartWrapper);
  }

  const cartHead = document.createElement("div");
  const cartIcon = document.createElement("p");
  const cartTitle = document.createElement("p");
  cartTitle.classList.add("cart__head__title");
  const closeCartButton = document.createElement("button");
  cartHead.classList.add("cart__head");
  closeCartButton.classList.add("cart__head__close-button");
  cartIcon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM208-800h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Z"/></svg>`;
  closeCartButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';

  if (!domCartContainer) {
    cartHead.appendChild(cartIcon);
    cartHead.appendChild(cartTitle);
    cartHead.appendChild(closeCartButton);
    cart.append(cartHead);
  }

  const productsContainer = document.createElement("div");
  const inCartContainer = document.createElement("div");
  const orderBumpsContainer = document.createElement("div");
  productsContainer.classList.add("cart__prod-container");
  inCartContainer.classList.add("cart__in-cart-container");
  orderBumpsContainer.classList.add("cart__order-bumps-container");
  productsContainer.appendChild(inCartContainer);
  productsContainer.appendChild(orderBumpsContainer);
  cart.appendChild(productsContainer);

  [cartOverlay, closeCartButton].forEach((el) => {
    el.addEventListener("click", () => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id.includes("ob")) {
          data.splice(i, 1);
          i--;
        }
      }
      document.querySelectorAll("[bump-increase-qtty-input]").forEach((input) => input.remove());
      document.querySelector(".cart__foot__price-div-wrapper")?.remove();
      cartWrapper.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
    });
  });

  const cartFoot = document.createElement("div");
  cartFoot.classList.add("cart__foot");

  const priceDivWrapper = document.createElement("div");
  priceDivWrapper.classList.add("cart__foot__price-div-wrapper");

  const totalText = document.createElement("p");
  totalText.innerHTML = "Total: ";
  totalText.classList.add("cart__foot__total-text");

  const oldNewPriceWrapper = document.createElement("div");
  oldNewPriceWrapper.classList.add("cart__foot__price-div");

  const oldPrice = document.createElement("p");
  oldPrice.classList.add("cart__foot__old-price");

  const newPrice = document.createElement("p");
  newPrice.classList.add("cart__foot__new-price");

  priceDivWrapper.appendChild(totalText);
  priceDivWrapper.appendChild(oldNewPriceWrapper);

  oldNewPriceWrapper.appendChild(oldPrice);
  oldNewPriceWrapper.appendChild(newPrice);

  let buyButton = document.createElement("button");
  buyButton.classList.add("buy-button");
  buyButton.innerHTML = "BUY NOW";

  cartFoot.appendChild(buyButton);

  if (lpParams.hasQtty) {
    cartFoot.appendChild(createQtty({ maxQtty: lpParams.hasQtty > 1 ? lpParams.hasQtty : undefined })[0]);
  }

  cart.appendChild(cartFoot);

  const replaceElement = (el) => {
    const elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
    return elClone;
  };

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("cart__title-div");
  const title = document.createElement("p");
  title.innerHTML = "YOU MAY ALSO LIKE";
  titleDiv.appendChild(title);

  const updateCartProducts = (data, btnDiscount, btnProducts, btnPrices) => {
    inCartContainer.innerHTML = "";
    orderBumpsContainer.innerHTML = "";
    orderBumpsContainer.appendChild(titleDiv);
    buyButton = replaceElement(buyButton);

    if (lpParams.prices || btnPrices) {
      const actualPrices = btnPrices || lpParams.prices;
      oldPrice.innerHTML = actualPrices.old;
      newPrice.innerHTML = actualPrices.new;
      cartFoot.insertBefore(priceDivWrapper, cartFoot.querySelector("*"));
    }

    data.forEach((prod) => {
      const quantity = (btnProducts && btnProducts[prod.id]?.quantity) || lpParams.products[prod.id]?.quantity;
      if (prod.isWhole && !prod.oneCard) {
        prod.variants.forEach((variant) => {
          const variantsOptions = lpParams.products[prod.id]?.variantsOptions || false;
          let variantQuantity;
          if (variantsOptions && variant.id.includes("ProductVariant/")) variantQuantity = variantsOptions[variant.id.split("ProductVariant/")[1]]?.quantity;
          else if (variantsOptions && variant.id.includes("option")) variantQuantity = variantsOptions[variant.id.split("option")[0]]?.quantity;
          else if (variantsOptions) variantQuantity = variantsOptions[variant.id]?.quantity;
          inCartContainer.appendChild(createProduct({ prod: variant, lpParams, isVariant: { title: prod.title, id: variant.id }, quantity: variantQuantity || quantity, data }));
        });
      } else {
        const prodCard = createProduct({ prod, quantity, lpParams, data, inCartContainer });
        if (prodCard) inCartContainer.appendChild(prodCard);
      }
    });
    if (orderBumpData)
      orderBumpData.forEach((prod) => {
        orderBumpsContainer.appendChild(createProduct({ prod, lpParams, isOrderBump: true, inCartContainer, orderBumpsContainer, data }));
      });

    buyButton.addEventListener("click", async () => {
      const result = await buy({ data, btnDiscount, lpParams, btnProducts });
    });
    cartWrapper.classList.toggle("active");
    if (!domCartContainer) document.body.classList.toggle("no-scroll");

    const updateCartTitle = () => {
      cartTitle.innerHTML = `SHOPPING CART (${inCartContainer.childElementCount})`;
    };
    const observer = new MutationObserver(() => {
      updateCartTitle();
    });
    observer.observe(inCartContainer, { childList: true });
    updateCartTitle();
  };

  return updateCartProducts;
};

export { createCart, handleOptionalProduct };
