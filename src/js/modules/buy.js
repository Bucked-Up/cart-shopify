import { fetchUrl, apiOptions } from "../variables.js";
import toggleLoading from "./toggleLoading.js";
import { dataLayerRedirect } from "./dataLayer.js";

const getVariantId = (data) => {
  const primaryWrapper = document.querySelector(`[primary="${data.id}"]`);
  if (primaryWrapper) {
    const secondaryWrapper = document.querySelector(`[secondary="${data.id}"]`);
    const primary = primaryWrapper.querySelector("input:checked");
    const secondary = secondaryWrapper.querySelector("input:checked");
    if (!secondary) return { result: false, wrapper: secondaryWrapper };
    return { result: data.variants.find((variant) => variant.title.includes(primary.value) && variant.title.includes(secondary.value)).id };
  } else {
    const input = document.querySelector(`[name="${data.id}"]:checked`);
    if (!input) return { result: false, wrapper: false };
    return { result: input.value };
  }
};

const addDiscount = async (checkoutId, code) => {
  const postDiscount = async (code) => {
    const input = {
      checkoutId: checkoutId,
      discountCode: code,
    };
    const query = `
      mutation checkoutDiscountCodeApplyV2($checkoutId: ID!, $discountCode: String!) {
        checkoutDiscountCodeApplyV2(checkoutId: $checkoutId, discountCode: $discountCode) {
          checkout {
            id
            webUrl
          }
        }
      }
    `;
    const body = {
      query: query,
      variables: input,
    };
    const response = await fetch(fetchUrl, {
      ...apiOptions,
      body: JSON.stringify(body),
    });
    return response;
  };

  let response;
  for (let indivCode of code.split("-")) {
    response = await postDiscount(indivCode);
    if (!response.ok) return response;
  }

  return response;
};

const addCustomAttributes = async (attributes, id) => {
  const input = {
    checkoutId: id,
    input: {
      customAttributes: attributes,
    },
  };
  const query = `
    mutation checkoutAttributesUpdateV2($checkoutId: ID!, $input: CheckoutAttributesUpdateV2Input!) {
      checkoutAttributesUpdateV2(checkoutId: $checkoutId, input: $input) {
        checkout {
          id
          customAttributes {
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
  const response = await fetch(fetchUrl, {
    ...apiOptions,
    body: JSON.stringify(body),
  });
  return response;
};

const startPopsixle = (id) => {
  if (typeof a10x_dl != "undefined") {
    a10x_dl.unique_checkout_id = id;
    session_sync(a10x_dl.s_id, "unique_checkout_id", a10x_dl.unique_checkout_id);
  } else {
    console.log("Popsixcle script not found.");
  }
};

//updates order
const buy = async (data, btnDiscount) => {
  const variantId = [];
  for (let product of data) {
    const quantity = +document.getElementById(`qtty-${product.id}`)?.value;
    if (product.isWhole) {
      variantId.push(
        ...product.variants.map((variant) => {
          return { id: variant.id };
        })
      );
    } else if (product.oneCard) {
      const prodContainer = document.querySelector(`[prod-id="${product.id.split("id")[0]}"]`);
      const choicesContainer = prodContainer.querySelector(".cart__placeholders");
      const variantsContainer = prodContainer.querySelector(".cart__variant-selection__container");
      console.log(choicesContainer);
      const button = choicesContainer.querySelector("button:not([variantGot])");
      if (!button) {
        variantsContainer.classList.add("shake");
        choicesContainer.querySelectorAll("button").forEach((button) => {
          button.removeAttribute("variantGot");
        });
        alert("Select your variant.");
        return false;
      }
      button.setAttribute("variantGot", "");
      variantId.push({ id: button.value, quantity });
    } else if (product.variants.length > 1) {
      const selectedVariant = getVariantId(product);
      if (!selectedVariant.result && !selectedVariant.wrapper) {
        alert("Sorry, there was a problem.");
        return false;
      }
      if (!selectedVariant.result) {
        selectedVariant.wrapper.classList.add("shake");
        alert("Select your size.");
        return false;
      }
      variantId.push({ id: selectedVariant.result, quantity });
    } else variantId.push({ id: product.variants[0].id, quantity });
  }

  toggleLoading();

  const quantity = +document.getElementById("cart-qtty-input")?.value || 1;

  const obj = variantId.map((variant) => {
    return { variantId: variant.id, quantity: variant.quantity || quantity };
  });
  const input = {
    input: {
      lineItems: [...obj],
    },
  };
  const query = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          webUrl
          id
          currencyCode
        }
      }
    }
  `;
  const body = {
    query: query,
    variables: input,
  };
  try {
    const response = await fetch(fetchUrl, {
      ...apiOptions,
      body: JSON.stringify(body),
    });
    const apiData = await response.json();
    console.log(apiData);
    if (!response.ok) throw new Error("Api Error.");
    const checkoutId = apiData.data.checkoutCreate.checkout.id;
    const bumpDiscount = orderBumpIds[data.find((prod) => prod.id.includes("ob"))?.id.split("ob")[0]]?.discountCode;
    if (discountCode !== "" || btnDiscount || bumpDiscount) {
      let discount;
      if (discountCode || btnDiscount) {
        discount = btnDiscount || discountCode;
        if (bumpDiscount) {
          discount = `${discount}-${bumpDiscount}`;
        }
      } else discount = bumpDiscount;
      const responseDiscount = await addDiscount(checkoutId, discount);
      if (!responseDiscount.ok) throw new Error("Api Discount Error.");
    }

    startPopsixle(checkoutId.split("?key=")[1]);
    const attributesResponse = await addCustomAttributes(
      [
        {
          key: "unique_checkout_id",
          value: `${checkoutId.split("?key=")[1]}`,
        },
      ],
      checkoutId
    );
    if (!attributesResponse.ok) throw new Error("Attributes Error.");

    dataLayerRedirect(data);
    window.location.href = apiData.data.checkoutCreate.checkout.webUrl;
    return true;
  } catch (error) {
    alert("There was a problem. Please try again later.");
    console.log(error);
  }
};

export default buy;
