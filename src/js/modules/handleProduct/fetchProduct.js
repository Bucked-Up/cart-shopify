import { handleFetch } from "../../variables.js";

const filterVariants = (data, products, isOrderBump) => {
  const ids = Object.keys(products);
  const isNotAvailable = (variant) => variant.node.availableForSale === false;
  const isAvailable = (variant) => variant.node.availableForSale === true;

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
      if (currentProduct.title) prod.title = currentProduct.title;
      if (currentProduct.hasQtty) prod.hasQtty = hasQtty;
      if (currentProduct.oneCard) prod.oneCard = true;
      if (currentProduct.variants)
        prod.variants.edges = prod.variants.edges.filter((filteredVariant) =>
          currentProduct.variants.includes(+filteredVariant.node.id.split("ProductVariant/")[1])
        );
      if (currentProduct.variantOf) {
        const mainProd = data.find((prod) => prod.id.includes(currentProduct.variantOf));
        prod.variants.edges.forEach((variant) => {
          mainProd.variants.edges.push(variant);
        });
        for (let i = 0; i < data.length; i++)
          if (data[i].id === prod.id) {
            data.splice(i, 1);
            break;
          }
      }
      if (currentProduct.isWhole) {
        prod.availableForSale = prod.variants.edges.every(isAvailable);
        prod.isWhole = true;
      } else if (currentProduct.variants) prod.availableForSale = !prod.variants.edges.every(isNotAvailable);
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
    if (!response.ok || data.data.nodes.some((prod) => prod === null)) {
      console.warn(response)
      console.warn(data);
      throw new Error("Error Fetching Api.");
    }
    data = data.data.nodes;
    filterVariants(data, products, isOrderBump);

    data.forEach((prod) => {
      if (!prod.availableForSale) console.warn("Out of stock: ", prod.id, prod.title);
      prod.id = prod.id.split("/").slice(-1)[0];

      prod.variants = prod.variants.edges.filter((edge) => edge.node.availableForSale);
      let minPrice = 99999;
      for (let key in prod.variants) {
        prod.variants[key] = prod.variants[key].node;
        prod.variants[key].title = prod.variants[key].title.split("(")[0];
        if (+prod.variants[key].price.amount < minPrice) minPrice = prod.variants[key].price.amount;
      }
      for (let key in prod.variants) {
        if (+prod.variants[key].price.amount > minPrice) {
          const string = ` (+$${(prod.variants[key].price.amount - minPrice).toFixed(2)})`;
          prod.variants[key].title = prod.variants[key].title + string;
        }
      }
    });
    return data;
  } catch (error) {
    alert("Product not found.");
    return Promise.reject(error);
  }
};

export default fetchProduct;
