import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order_products: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true },
        unit_price: { type: Number, required: true },
        discount_percent: { type: Number, required: true },
        required: true,
      },
    ],
    order_buyer: {
      name: { type: String, required: true },
      phone_number: { type: String, required: true },
      address: {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        street: { type: String, required: true },
        required: true,
      },
      required: true,
    },
    order_note: { type: String },
    total_products_cost: { type: Number, required: true },
    shipping_cost: { type: Number, required: true },
    final_cost: { type: Number, required: true },
    applied_coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
    order_status: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
