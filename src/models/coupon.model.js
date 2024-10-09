import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    coupon_name: { type: String, required: true },
    coupon_description: { type: String },
    coupon_type: { type: String, required: true },
    coupon_condition: { type: Number, required: true },
    coupon_unit: { type: String, required: true },
    coupon_value: { type: Number, required: true },
    coupon_max_value: { type: String },
    coupon_numbers: { type: Number, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    isAll: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
