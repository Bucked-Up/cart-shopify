import { getBenProducts } from "../../variables.js";

const fetchProductBen = async ({ products, country, isOrderBump }) => {
  if (isOrderBump && "increase" in products) return ["increase"];
  const convertData = (data) => {
    const isNotAvailable = (variant) => variant.availableForSale === false;
    const isAvailable = (variant) => variant.availableForSale === true;
    const newData = [];
    for (let prod of data) {
      const isNormalProduct = Object.hasOwn(prod.options[0].values[0], "in_stock");
      const currentProd = products[prod.id];
      const newProd = {};
      for (let option of prod.options) {
        if (!option.values.length == 0) {
          option.values = option.values.filter((value) => value.in_stock);
          if (option.values.length <= 0) {
            console.warn("Out of stock: ", prod.id);
            newProd.availableForSale = false;
            continue
          }
        }
      }
      if (prod.options.length === 0 && prod.stock["[]"] <= 0) {
        console.warn("Out of stock: ", prod.id);
        newProd.availableForSale = false;
        continue
      }
      newProd.availableForSale = true;
      newProd.options = [];
      newProd.id = `${prod.id}`;
      if (isOrderBump) {
        newProd.id = newProd.id + "ob";
      }
      newProd.title = prod.name;
      newProd.variants = [];
      newProd.oneCard = currentProd.oneCard;
      if (currentProd.title) prod.title = currentProd.title;
      prod.hasQtty = currentProd.hasQtty;
      prod.options.forEach((option) => {
        if (currentProd.variants) option.values = option.values.filter((value) => currentProd.variants.includes(value.id));
        option.values.forEach((value) => {
          if (!value.in_stock) return;
          const newVariant = {};
          newVariant.availableForSale = true;
          newVariant.id = `${value.id}option${option.id}`;
          newVariant.image = { src: value.images[0] };
          newVariant.price = { amount: `${Number(prod.price.slice(1)) - Number(value.price.slice(1))}` };
          newVariant.title = value.name;
          newProd.variants.push(newVariant);
        });
      });
      if (currentProd.isWhole) {
        newProd.availableForSale = newProd.variants.every(isAvailable);
        newProd.isWhole = true;
      } else if (currentProd.variants) newProd.availableForSale = !newProd.variants.every(isNotAvailable);
      newData.push(newProd);
    }
    return newData;
  };
  const ids = Object.keys(products);
  const data = await getBenProducts({ ids: ids, country: country });
  return convertData(data);
};

export default fetchProductBen;
