// import libs
import fs from "fs";
import path from "path";
import { createSlug } from "../../src/utils/functions/format.js";

// read json file
const rawProducts = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "..", "raw-data", "FORCATSHOP.products.json"),
    "utf8"
  )
);

// preprocess
const preprocessedProducts = rawProducts.map((product) => ({
  _id: product._id["$oid"],
  product_name: product.product_name,
  product_slug: product.product_slug,
  category_id: product.categories[0]["$oid"],
  product_imgs: product.product_imgs.map((img) => img.link),
  product_short_description: product.product_short_description,
  product_description: product.product_description,
  product_specifications: product.product_detail,
  product_variants: product.product_variants.map((variant) => ({
    variant_name: variant.variant_name,
    variant_slug: variant.variant_slug ?? createSlug(variant.variant_name),
    variant_price: variant.price,
    variant_img: variant.variant_imgs[0].link,
    variant_discount_percent: variant.discount_amount,
    variant_stock_quantity: variant.in_stock,
  })),
  product_supp_price: product.product_supp_price,
}));
// console.log("preprocessedProducts: ", preprocessedProducts);

// save to json file
fs.writeFile(
  path.join(import.meta.dirname, "..", "preprocessed-data", "products.preprocessed.json"),
  JSON.stringify(preprocessedProducts),
  (error) => {
    if (error) console.error("Lỗi khi lưu tệp JSON:", error);
    else console.log("Kết quả đã được lưu vào tệp products.preprocessed.json");
  }
);
