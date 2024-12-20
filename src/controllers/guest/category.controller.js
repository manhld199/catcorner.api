import mongoose from "mongoose";

import Category from "../../models/category.model.js";
import { notFound, ok, error, created } from "../../handlers/respone.handler.js";
import { encryptData, decryptData } from "../../utils/security.js";

// [GET] / api/guest/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([{ $match: {} }, { $sort: { createdAt: -1 } }]);

    // console.log("products: ", products);

    if (!categories.length) return notFound(res, {});

    return ok(res, { categories: categories });
  } catch (err) {
    console.log("Err: " + err);
    return error(res);
  }
};
