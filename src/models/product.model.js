import mongoose from "mongoose";

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

const Product = mongoose.model("Product", productSchema);
export default Product;
