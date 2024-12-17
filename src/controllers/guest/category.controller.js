import mongoose from "mongoose";

import Category from "../../models/category.model.js";
import { notFound, ok, error, created } from "../../handlers/respone.handler.js";
import { encryptData, decryptData } from "../../utils/security.js";

// [GET] / api/admin/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([{ $match: {} }, { $sort: { createdAt: -1 } }]);

    // Thêm category_id_hashed bằng cách áp dụng hàm encryptData
    const transformedCatrgories = categories.map((category) => ({
      ...category,
      category_id_hashed: encryptData(category._id.toString()),
    }));
    // console.log("products: ", products);

    if (!transformedCatrgories.length) return notFound(res, {});

    return ok(res, transformedCatrgories);
  } catch (err) {
    console.log("Err: " + err);
    return error(res);
  }
};
