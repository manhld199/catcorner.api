import Product from "../../models/product.model.js";
import { encryptData } from "../../utils/security.js";
import { decryptData } from "../../utils/security.js";
import { notFound, ok, error } from "../../handlers/respone.handler.js";

// [GET] /api/guest/product/:pid
export const getProduct = async (req, res, next) => {
  try {
    const encryptedProductId = req.params.pid;

    if (!encryptedProductId) {
      return error(res, "Product ID is missing");
    }
    const productId = decryptData(encryptedProductId);

    // Tìm sản phẩm và lấy thông tin của danh mục liên quan bằng cách sử dụng `populate`
    const product = await Product.findOne({ _id: productId })
      .populate({
        path: "category_id",
        select: "name", // Lấy tên danh mục
      })
      .populate({
        path: "recent_reviews",
        select:
          "_id product_variant_name review_rating user_info review_imgs review_video review_context createdAt",
      });

    if (!product) {
      return notFound(res, { message: "Product Not Found" });
    }

    return ok(res, {
      product: {
        _id: product._id,
        product_id_hashed: encryptData(product._id),
        product_name: product.product_name,
        product_slug: product.product_slug,
        category_name: product.category_id.name,
        product_imgs: product.product_imgs,
        product_avg_rating: product.product_rating,
        product_sold_quantity: product.product_sold_quantity,
        product_short_description: product.product_short_description,
        product_description: product.product_description,
        product_specifications: product.product_specifications,
        product_variants: product.product_variants,
        review_count: product.review_count,
        recent_reviews: product.recent_reviews,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (err) {
    console.error(err);
    return error(res, err.message);
  }
};

// [GET] /api/guest/product/getRecommend/:pid
export const getRecommend = async (req, res, next) => {
  try {
    const encryptedProductId = req.params.pid;
    const productId = decryptData(encryptedProductId);
    const product = await Product.findOne({ _id: productId }).populate("category_id");

    if (!product) {
      return notFound(res, { message: "Recommend Not Found" });
    }

    const productCategory = product.category_id._id;
    const relatedProducts = await Product.find({
      category_id: productCategory,
      _id: { $ne: productId },
    });

    const transformedProducts = relatedProducts.map((product) => {
      const lowestPriceVariant = product.product_variants.reduce((minPriceVariant, variant) => {
        if (
          !minPriceVariant ||
          (variant.variant_price * (100 - variant.variant_discount_percent)) / 100 <
            (minPriceVariant.variant_price * (100 - minPriceVariant.variant_discount_percent)) / 100
        ) {
          minPriceVariant = variant;
        }
        return minPriceVariant;
      }, null);

      const highestDiscountVariant = product.product_variants.reduce(
        (maxDiscountVariant, variant) => {
          if (
            !maxDiscountVariant ||
            variant.variant_discount_percent > maxDiscountVariant.variant_discount_percent
          ) {
            maxDiscountVariant = variant;
          }
          return maxDiscountVariant;
        },
        null
      );

      return {
        product_id_hashed: encryptData(product._id),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_avg_rating: product.product_rating,
        product_img: product.product_imgs[0],
        lowest_price: lowestPriceVariant
          ? (lowestPriceVariant.variant_price *
              (100 - lowestPriceVariant.variant_discount_percent)) /
            100
          : null,
        product_price: lowestPriceVariant ? lowestPriceVariant.variant_price : null,
        highest_discount: highestDiscountVariant
          ? highestDiscountVariant.variant_discount_percent
          : null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id.name,
        variant_id: lowestPriceVariant ? lowestPriceVariant._id : null,
        variant_name: lowestPriceVariant ? lowestPriceVariant.variant_name : null,
        variant_slug: lowestPriceVariant ? lowestPriceVariant.variant_slug : null,
      };
    });

    return ok(res, { relatedProducts: transformedProducts }, "Trả dữ liệu thành công");
  } catch (err) {
    console.error(err);
    return error(res, err.message);
  }
};
