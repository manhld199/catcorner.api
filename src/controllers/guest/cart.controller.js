import mongoose from "mongoose";
import Product from "../../models/product.model.js";
import { ok, notFound } from "../../handlers/respone.handler.js";
import { decryptData } from "../../utils/security.js";

// [GET] /api/guest/cart
export const getCartProducts = async (req, res, next) => {
  try {
    const cart = req.body.map((item) => ({
      product_id: new mongoose.Types.ObjectId(decryptData(decodeURIComponent(item.product_id))),
      variant_id: new mongoose.Types.ObjectId(item.variant_id),
      quantity: item.quantity,
    }));

    const cartProducts = await Product.aggregate([
      {
        $addFields: {
          cartData: cart, // Thêm giỏ hàng vào sản phẩm
        },
      },
      {
        $match: {
          $expr: {
            $in: ["$_id", cart.map((item) => item.product_id)], // Lọc sản phẩm theo product_id trong giỏ hàng
          },
        },
      },
      {
        $unwind: "$cartData", // Giải nén các item trong giỏ hàng
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$_id", "$cartData.product_id"] }, // Kiểm tra trùng khớp product_id
              { $in: ["$cartData.variant_id", "$product_variants._id"] }, // Kiểm tra trùng khớp variant_id
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          product_name: 1,
          product_slug: 1,
          product_id: "$cartData.product_id",
          variant_id: "$cartData.variant_id",
          product_variants: 1,
          quantity: "$cartData.quantity",
        },
      },
    ]);

    // console.log("cartProducts", cartProducts);
    // console.log("cartProducts", cartProducts.length);

    if (!cartProducts.length) return notFound(res, {});

    return ok(res, { products: cartProducts });
  } catch (err) {
    console.log("Err: " + err);
  }
};
