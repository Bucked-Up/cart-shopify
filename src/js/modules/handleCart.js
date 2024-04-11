import buy from "./buy.js";

const createInputRadio = ({ productId, variantId, text, variantPrice = "", plusPrice = false }) => {
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
  input.setAttribute("label-text", text);

  if (plusPrice) {
    const labelPrice = document.createElement("span");
    labelPrice.classList.add("label-price");
    labelPrice.innerHTML = ` (${plusPrice})`;
    labelText.appendChild(labelPrice);
  }

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
  const svg =
    '<svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5981 15.5C11.4434 17.5 8.55662 17.5 7.40192 15.5L1.33975 5C0.185047 3 1.62842 0.499998 3.93782 0.499998L16.0622 0.499999C18.3716 0.5 19.815 3 18.6603 5L12.5981 15.5Z" fill="black"/></svg>';
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

const handleSimpleProduct = ({ prod, productInfo, img }) => {
  let dropdown = undefined;
  const variantsWrapper = document.createElement("div");
  dropdown = createDropdown(prod.variants[0].title);
  productInfo.appendChild(dropdown);
  variantsWrapper.classList.add("cart__dropdown__variants");
  prod.variants.forEach((variant) => {
    const [wrapper, button] = createInputRadio({
      productId: prod.id,
      variantId: variant.id,
      text: variant.title,
      variantPrice: variant.price.amount,
    });
    variantsWrapper.appendChild(wrapper);
    variantsWrapper.querySelector("input").checked = true;
    button.addEventListener("change", () => {
      img.src = variant.image.src;
      img.alt = variant.title;
      dropdown.querySelector("p").innerHTML = button.getAttribute("label-text");
    });
  });
  dropdown.appendChild(variantsWrapper);
};

const handleComplexProduct = ({ prod, productInfo, img }) => {
  const primaryOption = prod.options[0];
  const secondaryOption = prod.options[1];
  primaryOption.values = primaryOption.values.filter((value) => {
    for (let variant of prod.variants) {
      if (variant.selectedOptions[0].value === value && variant.availableForSale) return true;
    }
    return false;
  });

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

  const placeHolders = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"].map((size) => {
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
    placeHolders.forEach((placeholder) => secondaryVariantsWrapper.appendChild(placeholder));
    prod.variants.forEach((variant) => {
      const newValue = variant.selectedOptions[1].value;
      const plusPrice = findPlusPrice(newValue, prod.variants);
      if (variant.title.includes(primarySelected) && !secondaryVariantsWrapper.querySelector("label")?.innerHTML.includes(newValue)) {
        const [wrapper, button] = createInputRadio({ productId: secondaryOption.id, variantId: newValue, text: getNewName(newValue), plusPrice: plusPrice });
        button.addEventListener("change", () => {
          secondaryVariantsWrapper.classList.remove("shake");
        });
        if (prevSelected?.value === newValue) {
          button.checked = true;
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
  primaryVariantsWrapper.querySelector("input").checked = true;
  primaryDropdown.appendChild(primaryVariantsWrapper);

  updateSecondaryOptions(primaryOption.values[0]);

  productInfo.appendChild(primaryDropdown);
  productInfo.appendChild(secondaryVariantsWrapper);
};

const createQtty = ({ inputId = undefined, maxQtty = undefined, addButton = undefined, price = undefined }) => {
  const updateTitle = (qtty) => {
    if (price) {
      const separetedString = addButton.innerHTML.split("$");
      separetedString[1] = (price * qtty).toFixed(2);
      addButton.innerHTML = separetedString.join("$");
    }
  };

  const plusBtn = document.createElement("button");
  plusBtn.classList.add("btn-plus");
  plusBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>';

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

const createPlaceholders = ({ prod, selectionDiv }) => {
  selectionDiv = document.createElement("div");
  selectionDiv.classList.add("cart__variant-selection");
  const title = document.createElement("p");
  title.innerHTML = `Select your variants: `;
  selectionDiv.appendChild(title);
  const selectionContainer = document.createElement("div");
  selectionContainer.classList.add("cart__variant-selection__container");
  selectionDiv.appendChild(selectionContainer);
  prod.variants.forEach((variant) => {
    const btn = createButton(variant);
    selectionContainer.appendChild(btn);
    btn.addEventListener("click", () => {
      const prodContainer = document.querySelector(`[prod-id="${prod.id.split("id")[0]}"] .cart__placeholders`);
      if (btn.parentElement.classList.contains("cart__variant-selection__container")) {
        const placeholder = prodContainer.querySelector('.cart__variant-placeholder:not([style*="display: none"])');
        const firstChild = prodContainer.querySelector("*");
        const clone = btn.cloneNode(true);
        clone.addEventListener("click", () => {
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

const createProduct = ({ prod, isVariant, isOrderBump, orderBumpsContainer, inCartContainer, data, quantity }) => {
  let prevProdWrapper;
  if (prod !== "increase") prevProdWrapper = document.querySelector(`[prod-id="${prod.id.split("id")[0]}"]`);
  let selectionDiv = undefined;
  if (prod.oneCard && !prevProdWrapper) {
    selectionDiv = createPlaceholders({
      prod,
      selectionDiv,
    });
  } else if (prod.oneCard) {
    increasePlaceholders(prevProdWrapper);
    return undefined;
  }

  const productWrapper = document.createElement("div");
  productWrapper.classList.add("cart__product");
  if (prod !== "increase") productWrapper.setAttribute("prod-id", isVariant ? isVariant.id : prod.id.split("id")[0]);

  const productContainer = document.createElement("div");
  productContainer.classList.add("cart__product__container");

  productWrapper.appendChild(productContainer);
  if (selectionDiv) productWrapper.appendChild(selectionDiv);

  const productInfo = document.createElement("div");
  productInfo.classList.add("cart__product__info");

  const title = document.createElement("p");
  title.classList.add("cart__product__title");
  title.innerHTML = isVariant?.title || prod.title || orderBumpIds[prod].title;
  productInfo.appendChild(title);
  if (isVariant) {
    const variantTitle = document.createElement("p");
    variantTitle.classList.add("cart__product__variant-title");
    variantTitle.innerHTML = prod.title;
    productInfo.appendChild(variantTitle);
  }

  let img = undefined;
  if (!prod.oneCard) {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("cart__product__img-wrapper");
    img = document.createElement("img");
    if (isVariant) {
      img.src = prod.image.src;
      img.alt = prod.title;
    } else {
      if (prod !== "increase") {
        img.src = prod.variants[0].image.src;
        img.alt = prod.variants[0].title;
      } else {
        img.src = orderBumpIds[prod].image;
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
    if (prod.options.length > 1) handleComplexProduct({ prod, productInfo, img });
    else if (!prod.oneCard) handleSimpleProduct({ prod, productInfo, img });
    else handleOneCardProduct({ prod, productInfo });
  }

  if (isOrderBump) {
    const addWrapper = document.createElement("div");
    addWrapper.classList.add("add-wrapper");
    const addButton = document.createElement("button");
    addButton.classList.add("add-button");
    const price = orderBumpIds[prod]?.price || orderBumpIds[prod.id.split("ob")[0]].price;
    addButton.innerHTML = `Add to cart for only +$${price}`;
    addWrapper.appendChild(addButton);
    let qttyWrapper, qttyInput;
    if (prod.hasQtty) {
      const maxQtty = typeof prod.hasQtty === "number" ? prod.hasQtty : false;
      [qttyWrapper, qttyInput] = createQtty({ inputId: `qtty-input-${prod.id}`, maxQtty, addButton, price });
      addWrapper.appendChild(qttyWrapper);
    }
    const getOrderBumpIncreaseProds = () => data.filter((prod) => !orderBumpIds["increase"].discart?.includes(+prod.id));
    addButton.addEventListener("click", () => {
      if (addButton.classList.contains("bump-added")) {
        addButton.classList.remove("bump-added");
        addButton.innerHTML = `Add to cart for only +$${price}`;
        orderBumpsContainer.appendChild(productWrapper);
        if (prod === "increase") {
          document.querySelectorAll("[bump-increase-qtty-input]").forEach((input) => input.remove());
        } else {
          data.splice(data.indexOf(prod), 1);
        }
      } else {
        if (prod === "increase") {
          getOrderBumpIncreaseProds().forEach((prod) => {
            const hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.setAttribute("bump-increase-qtty-input", "");
            hiddenInput.value = orderBumpIds["increase"].quantity;
            hiddenInput.id = `qtty-input-${prod.id}`;
            document.body.appendChild(hiddenInput);
          });
        } else {
          data.push(prod);
        }
        addButton.classList.add("bump-added");
        addButton.innerHTML = "Added to card";
        inCartContainer.appendChild(productWrapper);
      }
    });
    productInfo.appendChild(addWrapper);
  }

  return productWrapper;
};

const createCart = (data, orderBumpData) => {
  const cartWrapper = document.createElement("div");
  const cartOverlay = document.createElement("div");
  const cart = document.createElement("div");
  cartWrapper.classList.add("cart-wrapper");
  cartOverlay.classList.add("cart-overlay");
  cart.classList.add("cart");
  cartWrapper.appendChild(cartOverlay);
  cartWrapper.appendChild(cart);
  document.body.appendChild(cartWrapper);

  const cartHead = document.createElement("div");
  const cartTitle = document.createElement("p");
  const closeCartButton = document.createElement("button");
  cartHead.classList.add("cart__head");
  cartTitle.classList.add("cart__head__title");
  closeCartButton.classList.add("cart__head__close-button");
  cartTitle.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM208-800h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Z"/></svg>
  Cart`;
  closeCartButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';
  cartHead.appendChild(cartTitle);
  cartHead.appendChild(closeCartButton);
  cart.append(cartHead);

  const productsContainer = document.createElement("div");
  const inCartContainer = document.createElement("div");
  const orderBumpsContainer = document.createElement("div");
  productsContainer.classList.add("cart__prod-container");
  inCartContainer.classList.add("cart__in-cart-container");
  orderBumpsContainer.classList.add("cart__order-bumps-container");
  const bumpAtTop = Object.keys(orderBumpIds).some((id) => orderBumpIds[id].inTop);
  if (bumpAtTop) {
    orderBumpsContainer.classList.add("at-top");
    productsContainer.appendChild(orderBumpsContainer);
    productsContainer.appendChild(inCartContainer);
  } else {
    productsContainer.appendChild(inCartContainer);
    productsContainer.appendChild(orderBumpsContainer);
  }
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
      cartWrapper.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
    });
  });

  const cartFoot = document.createElement("div");
  cartFoot.classList.add("cart__foot");

  let buyButton = document.createElement("button");
  buyButton.classList.add("buy-button");
  buyButton.innerHTML = "BUY NOW";

  cartFoot.appendChild(buyButton);

  if (hasQtty) {
    cartFoot.appendChild(createQtty({ maxQtty: hasQtty > 1 ? hasQtty : undefined })[0]);
  }

  cart.appendChild(cartFoot);

  const replaceElement = (el) => {
    const elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
    return elClone;
  };

  const updateCartProducts = (data, btnDiscount, btnProducts) => {
    inCartContainer.innerHTML = "";
    orderBumpsContainer.innerHTML = "";
    buyButton = replaceElement(buyButton);
    data.forEach((prod) => {
      if (prod.isWhole) {
        prod.variants.forEach((variant) => {
          inCartContainer.appendChild(
            createProduct({ prod: variant, isVariant: { title: prod.title, id: prod.id }, quantity:btnProducts ? btnProducts[prod.id]?.quantity : undefined })
          );
        });
      } else {
        const prodCard = createProduct({ prod, quantity: btnProducts ? btnProducts[prod.id]?.quantity : undefined });
        if (prodCard) inCartContainer.appendChild(prodCard);
      }
    });
    orderBumpData.forEach((prod) => {
      orderBumpsContainer.appendChild(
        createProduct({ prod, quantity: btnProducts ? btnProducts[prod.id]?.quantity : undefined, isOrderBump: true, inCartContainer, orderBumpsContainer, data })
      );
    });
    buyButton.addEventListener("click", async () => {
      buyButton.toggleAttribute("disabled");
      const result = await buy(data, btnDiscount);
      if (!result) buyButton.toggleAttribute("disabled");
    });
    cartWrapper.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  };

  return updateCartProducts;
};

export { createCart };
