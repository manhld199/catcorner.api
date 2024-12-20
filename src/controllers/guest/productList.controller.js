import mongoose from "mongoose";
import Product from "../../models/product.model.js";
import { ok, notFound, error } from "../../handlers/respone.handler.js";
import { decryptData, encryptData } from "../../utils/security.js";

export const getNewestProducts = async (req, res) => {
  try {
    const newestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "product_name category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate({
        path: "category_id",
        select: "category_name", // Lấy tên danh mục
      });

    const transformedProducts = newestProducts.map((product) => {
      const lowestPriceVariant = product.product_variants.reduce((minPriceVariant, variant) => {
        const discountedPrice =
          (variant.variant_price * (100 - variant.variant_discount_percent)) / 100;
        if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
          minPriceVariant = {
            ...variant,
            discountedPrice,
            variantPrice: variant.variant_price,
          };
        }
        return minPriceVariant;
      }, null);

      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id.toString()),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_avg_rating: product.product_rating,
        product_img: product.product_imgs[0],
        product_price: lowestPriceVariant ? lowestPriceVariant.variantPrice : null,
        lowest_price: lowestPriceVariant?.discountedPrice || null,
        highest_discount: lowestPriceVariant?.variant_discount_percent || null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id?.category_name || "Unknown", // Lấy tên danh mục
        variant_names: variantNames,
      };
    });

    ok(res, transformedProducts, "Trả dữ liệu thành công");
  } catch (error) {
    console.error("Error in getNewestProducts:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm mới nhất.",
    });
  }
};

export const getTopRatedProducts = async (req, res) => {
  try {
    const topRatedProducts = await Product.find()
      .sort({ product_rating: -1, product_sold_quantity: -1 })
      .limit(10)
      .select(
        "product_name category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate({
        path: "category_id",
        select: "category_name", // Lấy tên danh mục
      });

    const transformedProducts = topRatedProducts.map((product) => {
      const lowestPriceVariant = product.product_variants.reduce((minPriceVariant, variant) => {
        const discountedPrice =
          (variant.variant_price * (100 - variant.variant_discount_percent)) / 100;
        if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
          minPriceVariant = { ...variant, discountedPrice };
        }
        return minPriceVariant;
      }, null);

      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id.toString()),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_avg_rating: product.product_rating,
        product_img: product.product_imgs[0],
        product_price: lowestPriceVariant ? lowestPriceVariant.variantPrice : null,
        lowest_price: lowestPriceVariant?.discountedPrice || null,
        highest_discount: lowestPriceVariant?.variant_discount_percent || null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id?.category_name || "Unknown",
        variant_names: variantNames,
      };
    });

    ok(res, transformedProducts, "Trả dữ liệu thành công");
  } catch (error) {
    console.error("Error in getTopRatedProducts:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm đánh giá cao nhất.",
    });
  }
};

export const getDiscountProducts = async (req, res) => {
  try {
    const discountProducts = await Product.find({
      product_variants: {
        $elemMatch: { variant_discount_percent: { $gt: 0 } },
      },
    })
      .sort({ product_rating: -1 })
      .limit(10)
      .select(
        "product_name category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate({
        path: "category_id",
        select: "category_name", // Lấy tên danh mục
      });

    const transformedProducts = discountProducts.map((product) => {
      const lowestPriceVariant = product.product_variants.reduce((minPriceVariant, variant) => {
        const discountedPrice =
          (variant.variant_price * (100 - variant.variant_discount_percent)) / 100;
        if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
          minPriceVariant = {
            ...variant,
            discountedPrice,
            variantPrice: variant.variant_price,
          };
        }
        return minPriceVariant;
      }, null);

      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id.toString()),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_avg_rating: product.product_rating,
        product_img: product.product_imgs[0],
        product_price: lowestPriceVariant ? lowestPriceVariant.variantPrice : null,
        lowest_price: lowestPriceVariant?.discountedPrice || null,
        highest_discount: lowestPriceVariant?.variant_discount_percent || null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id?.category_name || "Unknown",
        variant_names: variantNames,
      };
    });

    ok(res, transformedProducts, "Trả dữ liệu thành công");
  } catch (error) {
    console.error("Error in getDiscountProducts:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm giảm giá.",
    });
  }
};

export const getSearchRecommended = async (req, res) => {
  try {
    const { searchKey } = req.query;

    const searchConditions = searchKey
      ? {
          $or: [
            { product_name: { $regex: searchKey, $options: "i" } },
            { product_slug: { $regex: searchKey.replace(/\s+/g, "-"), $options: "i" } },
            { "category_id.name": { $regex: searchKey, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(searchConditions)
      .limit(4)
      .select(
        "product_name product_description category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate({
        path: "category_id",
        select: "category_name", // Lấy tên danh mục
      });

    const transformedProducts = products.map((product) => {
      const lowestPriceVariant = product.product_variants.reduce((minPriceVariant, variant) => {
        const discountedPrice =
          (variant.variant_price * (100 - variant.variant_discount_percent)) / 100;
        if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
          minPriceVariant = { ...variant, discountedPrice };
        }
        return minPriceVariant;
      }, null);

      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id.toString()),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_img: product.product_imgs[0],
        product_price: lowestPriceVariant ? lowestPriceVariant.variantPrice : null,
        lowest_price: lowestPriceVariant?.discountedPrice || null,
        highest_discount: lowestPriceVariant?.variant_discount_percent || null,
        variant_names: variantNames,
      };
    });

    ok(res, { searchKey, recommendedProducts: transformedProducts }, "Trả dữ liệu thành công");
  } catch (error) {
    console.error("Error in getSearchRecommended:", error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi tìm kiếm sản phẩm." });
  }
};

// Controller tìm kiếm + bộ lọc kết quả tìm kiếm
export const getSearchResult = async (req, res) => {
  try {
    let { searchKey, category, rating, minPrice, maxPrice, sortBy, discount, page } = req.query;
    const perPage = 20;
    const pageNumber = parseInt(page) || 1;

    let searchConditions = {};

    // Tìm kiếm theo từ khóa
    if (searchKey) {
      searchKey = searchKey.replace(/\s+/g, "(^\\s.+)|");
      let searchKeySlug = searchKey.replace(/\s+/g, "-");

      searchConditions.$or = [
        { product_name: { $regex: searchKey, $options: "i" } },
        { product_slug: { $regex: searchKeySlug, $options: "i" } },
        { "category_id.name": { $regex: searchKey, $options: "i" } },
        { product_description: { $regex: searchKey, $options: "i" } },
        { "product_variants.variant_name": { $regex: searchKey, $options: "i" } },
      ];
    }

    // Lọc theo danh mục
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        searchConditions["category_id"] = mongoose.Types.ObjectId(category);
      } else {
        searchConditions["category_id.name"] = { $regex: category, $options: "i" };
      }
    }

    // Lọc theo xếp hạng
    if (rating) {
      const minRating = parseFloat(rating) - 0.2;
      const maxRating = parseFloat(rating) + 0.99;
      searchConditions["product_rating.rating_point"] = { $gte: minRating, $lt: maxRating };
    }

    // Lọc theo giá
    if (minPrice && maxPrice) {
      searchConditions["product_variants.variant_price"] = { $gte: minPrice, $lte: maxPrice };
    }

    // Lọc theo giảm giá
    if (discount) {
      searchConditions["product_variants.variant_discount_percent"] = { $gt: 0 };
    }

    // Sắp xếp
    let sortOptions = {};
    if (sortBy === "hot") {
      sortOptions = { "product_rating.rating_point": -1, product_sold_quantity: -1 };
    } else if (sortBy === "new") {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === "sale") {
      sortOptions = { product_sold_quantity: -1 };
    } else if (sortBy === "price-z-to-a") {
      sortOptions["product_variants.variant_price"] = -1;
    } else if (sortBy === "price-a-to-z") {
      sortOptions["product_variants.variant_price"] = 1;
    }

    // Tính toán phân trang
    const totalProducts = await Product.countDocuments(searchConditions);
    const totalPages = Math.ceil(totalProducts / perPage);
    const skip = (pageNumber - 1) * perPage;

    // Truy vấn sản phẩm
    let products = await Product.find(searchConditions)
      .sort(sortOptions)
      .skip(skip)
      .limit(perPage)
      .select(
        "product_name product_slug product_imgs product_short_description product_description product_sold_quantity product_specifications category_id product_variants product_rating.rating_point product_rating.rating_count review_count"
      )
      .populate("category_id", "category_name");

    // Xử lý sản phẩm trả về
    const transformedProducts = products.map((product) => {
      if (!product._id) {
        console.error("Missing product ID for product:", product);
        return null;
      }

      const lowestPriceVariant = product.product_variants
        ? product.product_variants.reduce((minPriceVariant, variant) => {
            const discountedPrice =
              variant.variant_price * (1 - variant.variant_discount_percent / 100);
            if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
              minPriceVariant = {
                ...variant,
                discountedPrice,
                variantPrice: variant.variant_price,
              };
            }
            return minPriceVariant;
          }, null)
        : null;

      const highestDiscountVariant = product.product_variants
        ? product.product_variants.reduce((maxDiscountVariant, variant) => {
            if (
              !maxDiscountVariant ||
              variant.variant_discount_percent > maxDiscountVariant.variant_discount_percent
            ) {
              maxDiscountVariant = variant;
            }
            return maxDiscountVariant;
          }, null)
        : null;

      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id.toString()), // Đảm bảo _id là chuỗi
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_avg_rating: product.product_rating?.rating_point,
        product_img: product.product_imgs[0],
        lowest_price: lowestPriceVariant ? lowestPriceVariant.discountedPrice : null,
        product_price: lowestPriceVariant ? lowestPriceVariant.variantPrice : null,
        highest_discount: highestDiscountVariant
          ? highestDiscountVariant.variant_discount_percent
          : null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id?.category_name,
        variant_name: variantNames,
      };
    });

    res.status(200).json({
      success: true,
      data: transformedProducts,
      pagination: {
        totalPages,
        currentPage: pageNumber,
        totalResults: totalProducts,
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi tìm kiếm sản phẩm.",
    });
  }
};

export const getOrderProducts = async (req, res) => {
  try {
    const orderProducts = req.body.map((item) => ({
      product_id: new mongoose.Types.ObjectId(decryptData(item.product_hashed_id)),
      variant_id: new mongoose.Types.ObjectId(item.variant_id),
      quantity: item.quantity,
    }));

    const products = await Product.aggregate([
      // Unwind product_variants to process each variant as a separate document
      {
        $unwind: {
          path: "$product_variants",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Match each product_id and variant_id pair explicitly
      {
        $match: {
          $expr: {
            $or: orderProducts.map((item) => ({
              $and: [
                { $eq: ["$_id", item.product_id] },
                { $eq: ["$product_variants._id", item.variant_id] },
              ],
            })),
          },
        },
      },
      // Add the quantity from orderProducts by mapping each pair
      {
        $addFields: {
          quantity: {
            $reduce: {
              input: orderProducts,
              initialValue: 0,
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$$this.product_id", "$_id"] },
                      { $eq: ["$$this.variant_id", "$product_variants._id"] },
                    ],
                  },
                  then: "$$this.quantity",
                  else: "$$value",
                },
              },
            },
          },
        },
      },
      // Group by product and pick the first matching variant
      {
        $group: {
          _id: "$_id",
          product_name: { $first: "$product_name" },
          product_slug: { $first: "$product_slug" },
          product_variant: { $first: "$product_variants" },
          quantity: { $first: "$quantity" },
        },
      },
      // Project only the required fields
      {
        $project: {
          _id: 1,
          product_name: 1,
          product_slug: 1,
          product_variant: 1,
          quantity: 1,
        },
      },
    ]);

    if (!products.length) return notFound(res, {});

    const returnedProducts = products.map((product) => ({
      ...product,
      _id: undefined,
      product_hashed_id: encryptData(product._id.toString()),
    }));

    return ok(res, { products: returnedProducts });
  } catch (err) {
    console.log("Err: " + err);
    return error(res, { error: err.message });
  }
};
