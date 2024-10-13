import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    category_name: { type: String, required: true },
    category_img: { type: String, required: true },
    category_products_count: { type: Number },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
