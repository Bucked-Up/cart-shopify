import { handleFetch, trySentry } from "../../variables.js";
import { handleOptionalProduct } from "../handleCart.js";

const filterVariants = (data, products, isOrderBump) => {
  const ids = Object.keys(products);
  const isNotAvailable = (variant) => variant.node.availableForSale === false;
  const isAvailable = (variant) => variant.node.availableForSale === true;

  for (let key in products) {
    if (!key.includes("-")) continue;
    const keySplitted = key.split("-");
    for (let prodData of data) {
      if (prodData.id.includes(keySplitted[0])) {
        prodData.id = `${prodData.id}-${keySplitted[1]}`;
        break;
      }
    }
  }

  ids.forEach((id) => {
    const prod = data.find((prod) => prod.id.includes(id));
    const currentProduct = products[id];
    if (isOrderBump) {
      prod.id = prod.id + "ob";
    }
    if ("title" in currentProduct) {
      prod.title = currentProduct.title;
    }
    if (Object.keys(products).length > 0) {
      prod.variants = prod.variants.edges.filter((edge) => edge.node.availableForSale);
      if (currentProduct.title) prod.title = currentProduct.title;
      if (currentProduct.isOptional) prod.isOptional = currentProduct.isOptional;
      if (currentProduct.hasQtty) prod.hasQtty = hasQtty;
      if (currentProduct.noPriceUp) prod.noPriceUp = true;
      if (currentProduct.variants)
        prod.variants = prod.variants.filter((filteredVariant) => currentProduct.variants.includes(+filteredVariant.node.id.split("ProductVariant/")[1]));
      if (currentProduct.variantOf) {
        const mainProd = data.find((prod) => prod.id.includes(currentProduct.variantOf));
        prod.variants.forEach((variant) => {
          mainProd.variants.push(variant);
        });
      }
      if (currentProduct.isWhole) {
        prod.availableForSale = prod.variants.every(isAvailable);
        prod.isWhole = true;
      } else if (currentProduct.variants) prod.availableForSale = !prod.variants.every(isNotAvailable);
      if (currentProduct.oneCard && prod.variants.length > 1) prod.oneCard = true;
    }
  });
};

const fetchProduct = async ({ products, isOrderBump = false, country }) => {
  if (isOrderBump && "increase" in products) return ["increase"];
  const ids = Object.keys(products);
  const query = `
  { 
    nodes(ids: [${ids.map((id) => `"gid://shopify/Product/${id}"`)}]) {
      ... on Product {
        availableForSale
        title
        id
        options{
          ... on ProductOption{
            id
            name
            values
          }
        }
        variants(first: 100) {
          edges{
            node{
              id
              title
              availableForSale
              selectedOptions{
                name
                value
              }
              price{
                amount
              }
              image {
                ... on Image {
                  src
                }
              }
            }
          }
        }
      }
    }
  }
  `;
  try {
    const response = await handleFetch({ body: { query }, country });
    let data = await response.json();
    if (!response.ok) throw new Error(`Error Fetching Api. ${JSON.stringify(data)}`);
    if (data.data.nodes.some((prod) => prod === null)) throw new Error(`Missing Product. ${JSON.stringify(data)}`);
    data = data.data.nodes;
    filterVariants(data, products, isOrderBump);

    data.forEach((prod) => {
      if (!prod.availableForSale) {
        trySentry({ message: `Out of stock: ${prod.id} ${prod.title}` });
        return;
      }
      prod.id = prod.id.split("/").slice(-1)[0];

      let minPrice = 99999;
      for (let key in prod.variants) {
        prod.variants[key] = prod.variants[key].node;
        prod.variants[key].title = prod.variants[key].title.split("(")[0];
        if (+prod.variants[key].price.amount < minPrice) minPrice = prod.variants[key].price.amount;
      }
      if (!prod.noPriceUp)
        for (let key in prod.variants) {
          if (+prod.variants[key].price.amount > minPrice) {
            const plusPrice = (prod.variants[key].price.amount - minPrice).toFixed(2);
            const string = ` (+$${plusPrice})`;
            prod.variants[key].title = prod.variants[key].title + string;
            prod.variants[key].plusPrice = plusPrice;
          }
        }
      if (prod.isOptional) handleOptionalProduct({ prod });
    });
    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

export default fetchProduct;
