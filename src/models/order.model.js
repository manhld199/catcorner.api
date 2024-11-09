// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     order_products: [
//       {
//         product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//         variant_id: { type: mongoose.Schema.Types.ObjectId, required: true },
//         quantity: { type: Number, required: true },
//         unit_price: { type: Number, required: true },
//         discount_percent: { type: Number, required: true },
//         required: true,
//       },
//     ],
//     order_buyer: {
//       name: { type: String, required: true },
//       phone_number: { type: String, required: true },
//       address: {
//         province: { type: String, required: true },
//         district: { type: String, required: true },
//         ward: { type: String, required: true },
//         street: { type: String, required: true },
//         required: true,
//       },
//       required: true,
//     },
//     order_note: { type: String },
//     total_products_cost: { type: Number, required: true },
//     shipping_cost: { type: Number, required: true },
//     final_cost: { type: Number, required: true },
//     applied_coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
//     order_status: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model("Order", orderSchema);
// export default Order;

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order_products: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, ref: "Product", required: true },
        unit_price: { type: Number, ref: "Product", required: true },
        discount_percent: { type: Number, ref: "Product", required: true },
      },
    ],
    order_buyer: {
      name: { type: String, ref: "User", required: true },
      phone_number: { type: String, ref: "User", required: true },
      address: {
        province: { type: String, ref: "User", required: true },
        district: { type: String, ref: "User", required: true },
        ward: { type: String, ref: "User", required: true },
        street: { type: String, ref: "User", required: true },
      },
    },
    order_note: { type: String, ref: "User" },
    total_products_cost: { type: Number, ref: "Order", required: true },
    shipping_cost: { type: Number, ref: "Order", required: true },
    final_cost: { type: Number, ref: "Order", required: true },
    applied_coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }],
    order_status: { type: String, ref: "Order", required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
