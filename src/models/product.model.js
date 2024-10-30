import mongoose from "mongoose";

import { getCldPublicIdFromUrl } from "../utils/functions/format.js";
import cloudinary from "../libs/cloudinary.js";

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_slug: {
      type: String,
      required: true,
    },
    product_imgs: [
      {
        type: String,
        required: true,
      },
    ],
    product_short_description: {
      type: String,
    },
    product_description: {
      type: String,
      required: true,
    },
    product_specifications: [
      {
        name: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    product_variants: [
      {
        variant_name: {
          type: String,
          required: true,
        },
        variant_slug: {
          type: String,
          required: true,
        },
        variant_img: {
          type: String,
          required: true,
        },
        variant_price: {
          type: Number,
          required: true,
        },
        variant_stock_quantity: {
          type: Number,
          required: true,
        },
        variant_discount_percent: {
          type: Number,
          default: 0,
        },
      },
    ],
    product_rating: {
      rating_point: {
        type: Number,
        default: 0,
      },
      rating_count: {
        type: Number,
        default: 0,
      },
    },
    recent_reviews: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        user_name: {
          type: String,
          required: true,
        },
        user_avt: {
          type: String,
          required: true,
        },
        review_date: {
          type: Date,
          required: true,
        },
        variant_name: {
          type: String,
          required: true,
        },
        review_content: {
          type: String,
          required: true,
        },
        review_imgs: [
          {
            type: String,
          },
        ],
        review_vids: [
          {
            type: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre("deleteMany", async function (next) {
  // Lấy danh sách các sản phẩm dựa trên truy vấn sẽ xóa
  const products = await this.model.find(this.getQuery());

  // Lấy danh sách publicIds từ product_imgs và product_variants.variant_img
  const publicIds = products.flatMap((product) => [
    // Lấy các publicIds từ product_imgs
    ...product.product_imgs
      .filter(
        (url) => url.startsWith("https://res.cloudinary.com/") || url.startsWith("SEO_Images")
      )
      .map((url) => getCldPublicIdFromUrl(url)),

    // Lấy các publicIds từ product_variants.variant_img
    ...product.product_variants.flatMap((variant) =>
      variant.variant_img &&
      (variant.variant_img.startsWith("https://res.cloudinary.com/") ||
        variant.variant_img.startsWith("SEO_Images"))
        ? getCldPublicIdFromUrl(variant.variant_img)
        : []
    ),
  ]);

  // Xóa các tài nguyên trong Cloudinary
  if (publicIds.length > 0) {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image",
    });
  }

  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
