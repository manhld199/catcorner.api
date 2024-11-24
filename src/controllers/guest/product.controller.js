import Product from "../../models/product.model.js";
import { encryptData, decryptData } from "../../utils/security.js";
import { notFound, ok, error } from "../../handlers/respone.handler.js";

// [GET] /api/guest/product/:pid
export const getProduct = async (req, res, next) => {
  try {
    const encryptedProductId = req.params.pid;

    if (!encryptedProductId) {
      return error(res, "Product ID is missing");
    }

    let productId;
    try {
      productId = decryptData(encryptedProductId); // Giải mã Product ID
    } catch (err) {
      return error(res, "Invalid Product ID");
    }

    // Tìm sản phẩm và lấy thông tin của danh mục và đánh giá gần đây
    const product = await Product.findOne({ _id: productId })
      .populate({
        path: "category_id",
        select: "category_name", // Lấy tên danh mục
      })
      .populate({
        path: "recent_reviews",
        select:
          "_id product_variant_name review_rating user_info review_imgs review_video review_context createdAt",
      });

    if (!product) {
      return notFound(res, { message: "Product Not Found" });
    }

    const transformedProduct = {
      _id: product._id,
      product_id_hashed: encryptData(product._id.toString()),
      product_name: product.product_name,
      product_slug: product.product_slug,
      category_name: product.category_id?.category_name || "Unknown",
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
    };

    return ok(res, { product: transformedProduct });
  } catch (err) {
    console.error("Error in getProduct:", err);
    return error(res, err.message);
  }
};

// [GET] /api/guest/product/getRecommend/:pid
export const getRecommend = async (req, res, next) => {
  try {
    const encryptedProductId = req.params.pid;

    if (!encryptedProductId) {
      return error(res, "Product ID is missing");
    }

    let productId;
    try {
      productId = decryptData(encryptedProductId); // Giải mã Product ID
    } catch (err) {
      return error(res, "Invalid Product ID");
    }

    // Tìm sản phẩm gốc
    const product = await Product.findOne({ _id: productId }).populate("category_id");

    if (!product) {
      return notFound(res, { message: "Product Not Found" });
    }

    const productCategory = product.category_id?._id;
    if (!productCategory) {
      return error(res, "Product category not found");
    }

    // Lấy sản phẩm liên quan cùng danh mục (trừ sản phẩm hiện tại)
    const relatedProducts = await Product.find({
      category_id: productCategory,
      _id: { $ne: productId },
    });

    const transformedProducts = relatedProducts.map((relatedProduct) => {
      const lowestPriceVariant = relatedProduct.product_variants.reduce(
        (minPriceVariant, variant) => {
          const discountedPrice =
            (variant.variant_price * (100 - variant.variant_discount_percent)) / 100;
          if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
            minPriceVariant = { ...variant, discountedPrice };
          }
          return minPriceVariant;
        },
        null
      );

      const highestDiscountVariant = relatedProduct.product_variants.reduce(
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
        product_id_hashed: encryptData(relatedProduct._id.toString()),
        product_name: relatedProduct.product_name,
        product_slug: relatedProduct.product_slug,
        product_avg_rating: relatedProduct.product_rating,
        product_img: relatedProduct.product_imgs[0],
        lowest_price: lowestPriceVariant?.discountedPrice || null,
        product_price: lowestPriceVariant?.variant_price || null,
        highest_discount: highestDiscountVariant?.variant_discount_percent || null,
        product_sold_quantity: relatedProduct.product_sold_quantity,
        category_name: relatedProduct.category_id?.name || "Unknown",
        variant_id: lowestPriceVariant?._id || null,
        variant_name: lowestPriceVariant?.variant_name || null,
        variant_slug: lowestPriceVariant?.variant_slug || null,
      };
    });

    return ok(res, { relatedProducts: transformedProducts }, "Trả dữ liệu thành công");
  } catch (err) {
    console.error("Error in getRecommend:", err);
    return error(res, err.message);
  }
};
