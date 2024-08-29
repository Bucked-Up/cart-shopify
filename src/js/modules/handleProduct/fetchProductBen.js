import { getBenProducts, trySentry } from "../../variables.js";

const checkStock = (prod, mainId, secondId) => {
  return (
    (prod.stock[`[${mainId},${secondId}]`] !== undefined && prod.stock[`[${mainId},${secondId}]`] > 0) ||
    (prod.stock[`[${secondId},${mainId}]`] !== undefined && prod.stock[`[${secondId},${mainId}]`] > 0)
  );
};

const fetchProductBen = async ({ products, country, isOrderBump }) => {
  if (isOrderBump && "increase" in products) return ["increase"];
  const convertData = (data) => {
    const isNotAvailable = (variant) => variant.availableForSale === false;
    const isAvailable = (variant) => variant.availableForSale === true;
    const newData = [];
    for (let prod of data) {
      const isNormalProduct = Object.hasOwn(prod.options[0].values[0], "in_stock");
      const currentProd = products[prod.id];
      if (!isNormalProduct) {
        if (Object.values(prod.stock).every((val) => val <= 0)) {
          trySentry({message: `Out of stock: ${prod.id}`})
          data.noStock = true;
          return;
        }
        const mainOption = prod.options[0];
        const secondaryOption = prod.options[1];
        for (let mainValue of mainOption.values) {
          let hasStock = false;
          for (let secondValue of secondaryOption.values) {
            if (checkStock(prod, mainValue.id, secondValue.id)) {
              hasStock = true;
            }
          }
          if (!hasStock) mainOption.values = mainOption.values.filter((value) => value.id !== mainValue.id);
        }
        const newProd = {};
        newProd.availableForSale = true;
        newProd.options = [];
        newProd.id = `${prod.id}`;
        if (isOrderBump) {
          newProd.id = newProd.id + "ob";
        }
        newProd.title = currentProd.title || prod.name;
        newProd.variants = [];
        newProd.oneCard = currentProd.oneCard;
        newProd.hasQtty = currentProd.hasQtty;
        newProd.isBenSysShirt = true;
        prod.options.forEach((option) => {
          newProd.options.push({
            id: option.id,
            name: option.name,
            values: option.values.map((value) => value.name),
          });
        });
        prod.options[0].values.forEach((value0) => {
          prod.options[1].values.forEach((value1) => {
            if (checkStock(prod, value0.id, value1.id))
              newProd.variants.push({
                id: `${value0.id}-${value1.id}`,
                title: `${value0.name} / ${value1.name}`,
                availableForSale: true,
                selectedOptions: [
                  {
                    name: prod.options[0].name,
                    value: value0.name,
                  },
                  {
                    name: prod.options[1].name,
                    value: value1.name,
                  },
                ],
                image: {
                  src: value0.images[0],
                },
              });
          });
        });
        newData.push(newProd);
      } else {
        for (let option of prod.options) {
          const newProd = {};
          if (!option.values.length == 0) {
            option.values = option.values.filter((value) => value.in_stock);
            if (option.values.length <= 0) {
              trySentry({message: `Out of stock: ${prod.id}`})
              newProd.availableForSale = false;
              continue;
            }
          }
          newProd.availableForSale = true;
          newProd.options = [];
          newProd.id = `${prod.id}`;
          if (isOrderBump) {
            newProd.id = newProd.id + "ob";
          }
          newProd.title = currentProd.title || prod.name;
          newProd.variants = [];
          newProd.oneCard = currentProd.oneCard;
          newProd.hasQtty = currentProd.hasQtty;
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
          if (currentProd.isWhole) {
            newProd.availableForSale = newProd.variants.every(isAvailable);
            newProd.isWhole = true;
          } else if (currentProd.variants) newProd.availableForSale = !newProd.variants.every(isNotAvailable);
          newData.push(newProd);
        }
      }
    }
    return newData;
  };
  const ids = Object.keys(products);
  const data = await getBenProducts({ ids: ids, country: country });
  return convertData(data);
};

export default fetchProductBen;
