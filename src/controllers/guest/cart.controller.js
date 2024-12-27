import mongoose from "mongoose";
import Product from "../../models/product.model.js";
import { ok, notFound, error } from "../../handlers/respone.handler.js";
import { decryptData, encryptData } from "../../utils/security.js";

export const getCartProducts = async (req, res, next) => {
  try {
    // Chuẩn bị dữ liệu từ client (decrypt các product_hashed_id)
    const cart = req.body.map((item) => ({
      product_id: new mongoose.Types.ObjectId(decryptData(item.product_hashed_id)),
      variant_id: new mongoose.Types.ObjectId(item.variant_id),
      quantity: item.quantity,
    }));

    // // Truy xuất dữ liệu từ MongoDB
    const cartProducts = await Product.aggregate([
      {
        $addFields: {
          cartData: cart, // Thêm dữ liệu giỏ hàng vào sản phẩm
        },
      },
      {
        $match: {
          $expr: {
            $in: ["$_id", cart.map((item) => item.product_id)], // Lọc theo product_id trong giỏ hàng
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

    if (!cartProducts.length) return notFound(res, {});

    // Mã hóa product_id trước khi trả về
    const response = cartProducts.map((product) => ({
      ...product,
      product_hashed_id: encryptData(product.product_id.toString()),
    }));

    return ok(res, { products: response });
  } catch (err) {
    console.error("Error in getCartProducts:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
