import { apiOptions, fetchUrl } from "../../variables.js";

const filterVariants = (data, ids, isOrderBump) => {
  const containsNumber = (str) => /\d/.test(str);
  const getVariants = (id) => {
    const idStart = "gid://shopify/ProductVariant/";
    const idsArray = typeof id == "string" ? id.split("-") : false;
    if (idsArray && containsNumber(id.split("-")[1])) {
      const filteredIds = [];
      for (let i = 0; i < idsArray.length && containsNumber(idsArray[i]); i++) {
        filteredIds.push(idStart + idsArray[i]);
      }
      return { ids: filteredIds, isWhole: idsArray.includes("whole"), noDrop: idsArray.includes("noDrop") };
    }
    return { ids: null, noDrop: idsArray && idsArray.includes("noDrop"), isWhole: idsArray && idsArray.includes("whole") };
  };

  const isNotAvailable = (variant) => variant.node.availableForSale === false;
  const isAvailable = (variant) => variant.node.availableForSale === true;

  const addCustomTitle = (id) => {
    if ("title" in orderBumpIds[id]) {
      data.find((prod) => prod.id.includes(id)).title = orderBumpIds[id].title;
    }
  };

  const setIsOrderBump = (id) => {
    if (isOrderBump) {
      const prod = data.find((prod) => prod.id.includes(id));
      prod.id = prod.id + "ob";
      addCustomTitle(id);
    }
  };

  ids.forEach((id) => {
    setIsOrderBump(id);
    const variants = getVariants(id);
    const bumpNoDrop = id in orderBumpIds && orderBumpIds[id].noDrop;
    const hasQtty = id in orderBumpIds && orderBumpIds[id].hasQtty;
    if (variants.ids || variants.isWhole || variants.noDrop || bumpNoDrop || hasQtty) {
      const prod = data.find((prod) => prod.id.includes(id.split("-")[0]));
      if (hasQtty) prod.hasQtty = hasQtty;
      if (variants.noDrop || bumpNoDrop) prod.noDrop = true;
      if (variants.ids) prod.variants.edges = prod.variants.edges.filter((filteredVariant) => variants.ids.includes(filteredVariant.node.id));
      if (variants.isWhole) {
        prod.availableForSale = prod.variants.edges.every(isAvailable);
        prod.isWhole = true;
      } else if (variants.ids) prod.availableForSale = !prod.variants.edges.every(isNotAvailable);
    }
  });
};

const fetchProduct = async ({ ids, isOrderBump = false }) => {
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
    filterVariants(data, ids, isOrderBump);

    data.forEach((prod) => {
      if (!prod.availableForSale) console.log("Out of stock: ", prod.id, prod.title);
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
    console.log(error);
    return null;
  }
};

export default fetchProduct;
