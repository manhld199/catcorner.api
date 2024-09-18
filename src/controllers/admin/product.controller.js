import Product from "../../models/product.model.js";
import { ok } from "../../handlers/respone.handler.js";

// [GET] / api/admin/products/getProducts
export const getProducts = async (req, res, next) => {
  try {
    return ok(res, { products: "admin product" });
  } catch (err) {
    console.log("Err: " + err);
  }
};
