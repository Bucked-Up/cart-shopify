import { apiOptions, fetchUrl } from "../../variables.js";

const filterVariants = (data, ids) => {
  const getVariants = (id) => {
    const idStart = "gid://shopify/ProductVariant/";
    if (typeof id == "string" && id.includes("-")) {
      const filteredIds = [];
      const idsArray = id.split("-");
      let i = idsArray[1].includes("whole") ? 2 : 1;
      for (i; i < idsArray.length; i++) {
        filteredIds.push(idStart + idsArray[i].replace("-", ""));
      }
      return { ids: filteredIds, isWhole: idsArray[1].includes("whole") };
    }
    return { ids: null };
  };

  const getProdIndex = (data, id) => {
    id = id.split("-")[0];
    for (let i = 0; i < data.length; i++) {
      if (data[i].id.includes(id)) return i;
    }
  };

  const isAvailable = (variant) => variant.node.availableForSale === false;
  const isAvailableWhole = (variant) => variant.node.availableForSale === true;

  ids.forEach((id) => {
    const variants = getVariants(id);
    if (variants.ids) {
      const i = getProdIndex(data, id);
      data[i].variants.edges = data[i].variants.edges.filter((filteredVariant) => variants.ids.includes(filteredVariant.node.id));
      if (variants.isWhole) {
        data[i].availableForSale = data[i].variants.edges.every(isAvailableWhole);
        data[i].isWhole = true;
      } else data[i].availableForSale = !data[i].variants.edges.every(isAvailable);
    }
  });
};

const fetchProduct = async ({ ids }) => {
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
    const response = await fetch(fetchUrl, {
      ...apiOptions,
      body: JSON.stringify({ query: query }),
    });
    let data = await response.json();
    if (!response.ok) {
      throw new Error("Error Fetching Api.");
    }
    data = data.data.nodes;
    filterVariants(data, ids);

    data.forEach((obj) => {
      if (!obj.availableForSale) console.log("Out of stock: ", obj.id, obj.title);
      obj.id = obj.id.split("/").slice(-1)[0];

      obj.variants = obj.variants.edges.filter((edge) => edge.node.availableForSale || (!edge.node.availableForSale && edge.node["last-variant"]));
      let minPrice = 99999;
      for (let key in obj.variants) {
        obj.variants[key] = obj.variants[key].node;
        obj.variants[key].title = obj.variants[key].title.split("(")[0];
        if (+obj.variants[key].price.amount < minPrice) minPrice = obj.variants[key].price.amount;
      }
      for (let key in obj.variants) {
        if (+obj.variants[key].price.amount > minPrice) {
          const string = ` (+$${(obj.variants[key].price.amount - minPrice).toFixed(2)})`;
          obj.variants[key].title = obj.variants[key].title + string;
        }
      }
    });
    return data;
  } catch (error) {
    alert("Product not found.");
    console.log(error);
    return null;
  }
};

export default fetchProduct;
