import mongoose from "mongoose";

import Category from "../../models/category.model.js";
import { notFound, ok } from "../../handlers/respone.handler.js";

// [GET] / api/admin/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.aggregate([{ $match: {} }]);

    // console.log("products: ", products);

    if (!categories.length) return notFound(res, {});

    return ok(res, { categories: categories });
  } catch (err) {
    console.log("Err: " + err);
  }
};

// [GET] / api/admin/categories/{id}
export const getCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const objectId = new mongoose.Types.ObjectId(id);
    const categories = await Category.aggregate([
      {
        $match: { _id: objectId },
      },
    ]);

    // console.log("products: ", products);

    if (!categories.length) return notFound(res, {});

    return ok(res, { category: categories[0] });
  } catch (err) {
    console.log("Err: " + err);
  }
};
