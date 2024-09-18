import Product from "../../models/product.model.js";
import { ok } from "../../handlers/respone.handler.js";

// [GET] / api/guest/products/getProducts
export const getProducts = async (req, res, next) => {
  try {
    return ok(res, { products: "guest product" });
  } catch (err) {
    console.log("Err: " + err);
  }
};
