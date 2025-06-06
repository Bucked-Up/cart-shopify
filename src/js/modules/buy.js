import toggleLoading from "./toggleLoading.js";
import { dataLayerRedirect } from "./dataLayer.js";
import { handleError, handleFetch, trySentry } from "../variables.js";
import { getUserId } from "./intellimize.js";

const getVariantId = (product, oneCardQuantity) => {
  const primaryWrapper = document.querySelector(`[primary="${product.id}"]`);
  if (primaryWrapper) {
    const secondaryWrapper = document.querySelector(`[secondary="${product.id}"]`);
    const primary = primaryWrapper.querySelector("input:checked");
    const secondary = secondaryWrapper.querySelector("input:checked");
    if (!secondary) return { result: false, wrapper: secondaryWrapper, message: "Select your size." };
    return { result: product.variants.find((variant) => variant.title.includes(primary.value) && variant.title.includes(secondary.value)).id };
  } else if (product.oneCard && !product.isWhole) {
    const prodContainer = document.querySelector(`[prod-id="${product.id.split("id")[0]}"]`);
    const choicesContainer = prodContainer.querySelector(".cart__placeholders");
    const variantsContainer = prodContainer.querySelector(".cart__variant-selection__container");
    const values = Array.from(choicesContainer.querySelectorAll("button")).map((button) => button.value);
    if (!values.length || values.length < oneCardQuantity) {
      variantsContainer.classList.add("shake");
      choicesContainer.querySelectorAll("button").forEach((button) => {
        button.removeAttribute("variantGot");
      });
      return { result: false, wrapper: variantsContainer, message: "Select your variants." };
    }
    const uniqueArray = [];
    values.forEach((id) => {
      const existing = uniqueArray.find((item) => item.result === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        uniqueArray.push({ result: id, quantity: 1 });
      }
    });
    return uniqueArray;
  } else {
    const input = document.querySelector(`[name="${product.id}"]:checked`);
    if (!input) return { result: false, wrapper: false, message: "Sorry, there was a problem." };
    return { result: input.value };
  }
};

const addAttributes = async (attributes, id, country) => {
  const input = {
    input: attributes,
    cartId: id,
  };
  const query = `
    mutation cartAttributesUpdate($input: [AttributeInput!]!, $cartId: ID!) {
      cartAttributesUpdate(attributes: $input, cartId: $cartId) {
        cart {
          id
          attributes {
            key
            value
          }
        }
      }
    }
  `;
  const body = {
    query: query,
    variables: input,
  };
  const response = await handleFetch({ body, country });
  return response;
};

const startPopsixle = (id) => {
  if (typeof a10x_dl != "undefined") {
    a10x_dl.unique_checkout_id = id;
    session_sync(a10x_dl.s_id, "unique_checkout_id", a10x_dl.unique_checkout_id);
  } else {
    console.warn("Popsixcle script not found.");
  }
};

const buy = async ({ data, btnDiscount, lpParams, noCart, btnProducts }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const variantId = [];

  const seenOneCardIds = new Set();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].oneCard && !data[i].isWhole) {
      if (seenOneCardIds.has(data[i].id.split("id")[0])) {
        data.splice(i, 1);
      } else {
        seenOneCardIds.add(data[i].id.split("id")[0]);
      }
    }
  }

  for (let product of data) {
    if (product.oneCard && !product.isWhole) {
      const prodQuantity = (btnProducts && btnProducts[product.id.split("id")[0]]?.quantity) || lpParams.products[product.id.split("id")[0]].quantity || 1;
      const selectedVariant = getVariantId(product, prodQuantity);
      if (!selectedVariant[0]?.result) return;
      selectedVariant.forEach((variant) => {
        variantId.push({ id: variant.result, quantity: variant.quantity, prod: product });
      });
    } else {
      const inputQtty = +document.getElementById(`qtty-input-${product.id}`)?.value || 1;
      const prodQtty = +document.getElementById(`${product.id}-quantity`)?.innerHTML || 1;
      let quantity = inputQtty * prodQtty;
      if (product.isWhole) {
        variantId.push(
          ...product.variants.map((variant) => {
            const prodContainer = document.querySelector(`[prod-id="${product.id.split("id")[0]}"]`);
            const initialQuantity = +document.getElementById(`${variant.id}-quantity`)?.innerHTML || prodContainer?.getAttribute(`variant-qtty-${variant.id.split("ProductVariant/")[1] || variant.id.split("option")[0]}`);
            const variantQuantity = inputQtty * (initialQuantity || 1);
            return { id: variant.id, quantity: variantQuantity, prod: product };
          })
        );
      } else if (product.variants.length > 1 && (!noCart || (noCart && product.isOptional))) {
        const selectedVariant = getVariantId(product);
        if (!selectedVariant.result) {
          alert(selectedVariant.message);
          if (selectedVariant.wrapper) selectedVariant.wrapper.classList.add("shake");
          return false;
        }
        variantId.push({ id: selectedVariant.result, quantity, prod: product });
      } else variantId.push({ id: product.variants[0].id, quantity: noCart ? product.quantity : quantity, prod: product });
    }
  }

  toggleLoading();

  const globalQuantity = +document.getElementById("cart-qtty-input")?.value || 1;

  const obj = variantId.map((variant) => {
    return { merchandiseId: variant.id, quantity: globalQuantity * variant.quantity };
  });
  if ("isBenSys" in lpParams) {
    let string = "";
    variantId.forEach((variant, i) => {
      if (variant.prod.isBenSysShirt) {
        string = string + `&products[${i}][id]=${variant.prod.id.split("id")[0].split("ob")[0]}&products[${i}][quantity]=${variant.quantity}&products[${i}][options][${variant.prod.options[0].id}]=${variant.id.split("-")[0]}&products[${i}][id]=${variant.prod.id.split("id")[0].split("ob")[0]}&products[${i}][quantity]=${variant.quantity}&products[${i}][options][${variant.prod.options[1].id}]=${variant.id.split("-")[1]}`;
      } else {
        const [variantId, optionID] = variant.id.split("option");
        string = string + `&products[${i}][id]=${variant.prod.id.split("id")[0].split("ob")[0]}&products[${i}][quantity]=${variant.quantity}&products[${i}][options][${optionID}]=${variantId}`;
      }
    });
    dataLayerRedirect(lpParams.dataLayer, data);
    urlParams.set("cc", lpParams.discountCode || urlParams.get("discount"));
    if (lpParams.country === "uk") window.location.href = `https://www.buckedup.co.uk/cart/add?${string}&clear=true&${urlParams}`;
    else window.location.href = `https://${lpParams.country && lpParams.country !== "us" ? lpParams.country + "." : ""}buckedup.com/cart/add?${string}&clear=true&${urlParams}`;
  } else {
    const getDiscountCodes = () => {
      const hasBumpIncreaseDiscount = document.querySelector("[bump-increase-qtty-input]");
      let bumpDiscount = (hasBumpIncreaseDiscount && lpParams.bump.discountCode) || (data.find((prod) => prod.id.includes("ob")) && lpParams.bump.discountCode);
      data
        .filter((prod) => prod.id.includes("ob"))
        .forEach((prod) => {
          const discountCode = lpParams.bump.products[prod.id.split("ob")[0]].discountCode;
          if (discountCode) bumpDiscount = bumpDiscount + "-" + lpParams.bump.products[prod.id.split("ob")[0]].discountCode;
        });
      const urlDiscount = urlParams.get("discount");
      if (lpParams.discountCode !== "" || btnDiscount || bumpDiscount || urlDiscount) {
        let discount;
        if (lpParams.discountCode || btnDiscount) {
          discount = btnDiscount || lpParams.discountCode;
          if (bumpDiscount) {
            discount = `${discount}-${bumpDiscount}`;
          }
        } else discount = bumpDiscount;
        if (urlDiscount) discount = discount ? discount + `-${urlDiscount}` : urlDiscount;
        return discount.split("-");
      }
    };
    const discountCodes = getDiscountCodes();
    const input = {
      input: {
        discountCodes: discountCodes,
        lines: obj,
      },
    };
    const query = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            checkoutUrl
            id
          }
        }
      }
    `;
    const body = {
      query: query,
      variables: input,
    };
    try {
      const response = await handleFetch({ body, country: lpParams.country });
      const apiData = await response.json();
      if (!response.ok || apiData.errors) throw new Error(`Api Error. ${JSON.stringify(apiData)}`);
      const cartId = apiData.data.cartCreate.cart.id;
      startPopsixle(cartId.split("?key=")[1]);
      const getClickIds = () => {
        const paramsObject = {};
        const allowedParams = ["gclid", "gbraid", "fbclid", "fbc", "ScCid", "epik", "ttclid", "twclid"];
        for (let [key, value] of urlParams) {
          if (allowedParams.includes(key)) {
            if (!paramsObject[key]) {
              paramsObject[key] = [];
            }
            paramsObject[key].push(value);
          }
        }
        const paramsArray = Object.entries(paramsObject).map(([key, values]) => (values.length > 1 ? `${key}=[${values.join(" , ")}]` : `${key}=${values[0]}`));
        const string = paramsArray.join(" , ");
        return string;
      };
      const attributesResponse = await addAttributes(
        [
          {
            key: "unique_checkout_id",
            value: `${cartId.split("?key=")[1]}`,
          },
          {
            key: "intellimize_user_id",
            value: getUserId() || "undefined",
          },
          {
            key: "affiliate",
            value: urlParams.get("affiliate") || "undefined",
          },
          {
            key: "subid",
            value: urlParams.get("subid") || "undefined",
          },
          {
            key: "click_ids",
            value: getClickIds() || "undefined",
          },
          {
            key: "utm_source",
            value: urlParams.get("utm_source") || "undefined",
          },
          {
            key: "utm_medium",
            value: urlParams.get("utm_medium") || "undefined",
          },
          {
            key: "utm_campaign",
            value: urlParams.get("utm_campaign") || "undefined",
          },
          {
            key: "utm_content",
            value: urlParams.get("utm_content") || "undefined",
          },
          {
            key: "utm_adid",
            value: urlParams.get("utm_adid") || "undefined",
          },
          {
            key: "source_url",
            value: window.location.href,
          },
        ],
        cartId,
        lpParams.country
      );
      const attributesData = await attributesResponse.json();
      if (!attributesResponse.ok) throw new Error(`Attributes Error. ${JSON.stringify(attributesData)}`);
      dataLayerRedirect(lpParams.dataLayer, data);
      window.location.href = `${apiData.data.cartCreate.cart.checkoutUrl}&${urlParams}`;
      return true;
    } catch (error) {
      trySentry({ error });
      handleError();
      return;
    }
  }
};

export default buy;
