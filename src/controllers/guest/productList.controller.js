import mongoose from "mongoose";
import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
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
        select: "category_name",
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

    // Chuyển đổi các giá trị từ query
    minPrice = minPrice ? parseInt(minPrice) : undefined;
    maxPrice = maxPrice ? parseInt(maxPrice) : undefined;
    page = page ? parseInt(page) : 1;
    discount = discount === "true";

    const perPage = 12;
    const pageNumber = page;

    let searchConditions = {};

    // Tìm kiếm theo từ khóa
    if (searchKey) {
      searchKey = searchKey.replace(/\s+/g, "(^\\s.+)|");
      const searchKeySlug = searchKey.replace(/\s+/g, "-");

      searchConditions.$or = [
        { product_name: { $regex: searchKey, $options: "i" } },
        { product_slug: { $regex: searchKeySlug, $options: "i" } },
        { "category_id.name": { $regex: searchKey, $options: "i" } },
        { product_description: { $regex: searchKey, $options: "i" } },
        { "product_variants.variant_name": { $regex: searchKey, $options: "i" } },
      ];
    }

    // Lọc theo danh mục (hỗ trợ nhiều danh mục)
    if (category) {
      const categoryNames = category.split(",");
      const categories = await Category.find({ category_name: { $in: categoryNames } }).select(
        "_id"
      );
      const categoryIds = categories.map((cat) => cat._id);
      searchConditions["category_id"] = { $in: categoryIds };
    }

    // Lọc theo xếp hạng (áp dụng nguyên tắc làm tròn rating)
    if (rating) {
      const ratings = rating.split(",").map((r) => parseInt(r, 10)); // Chuyển đổi về số nguyên
      searchConditions["$or"] = ratings.map((r) => ({
        "product_rating.rating_point": { $gte: r - 0.5, $lt: r + 0.5 },
      }));
    }

    // Lọc theo giá
    if (minPrice !== undefined && maxPrice !== undefined) {
      searchConditions["product_variants.variant_price"] = { $gte: minPrice, $lte: maxPrice };
    }

    // Lọc theo giảm giá
    if (discount) {
      searchConditions["product_variants.variant_discount_percent"] = { $gt: 0 };
    }

    // Sắp xếp
    let sortOptions = {};

    if (sortBy === "recent") {
      sortOptions = { createdAt: -1 }; // Sắp xếp theo ngày tạo mới nhất
    } else if (sortBy === "low-to-high") {
      sortOptions = { "product_variants.variant_price": 1 }; // Giá thấp đến cao
    } else if (sortBy === "high-to-low") {
      sortOptions = { "product_variants.variant_price": -1 }; // Giá cao đến thấp
    } else if (sortBy === "best-rating") {
      sortOptions = { "product_rating.rating_point": -1 }; // Đánh giá cao
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
      if (!product._id) return null;

      const lowestPriceVariant = product.product_variants
        ? product.product_variants.reduce((minPriceVariant, variant) => {
            const discountedPrice =
              variant.variant_price * (1 - (variant.variant_discount_percent || 0) / 100);
            if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
              return { ...variant, discountedPrice, variantPrice: variant.variant_price };
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
              return variant;
            }
            return maxDiscountVariant;
          }, null)
        : null;

      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id.toString()),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_avg_rating: product.product_rating?.rating_point,
        product_img: product.product_imgs[0],
        lowest_price: lowestPriceVariant?.discountedPrice || null,
        product_price: lowestPriceVariant?.variantPrice || null,
        highest_discount: highestDiscountVariant?.variant_discount_percent || null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id?.category_name || null,
        variant_name: variantNames,
      };
    });

    res.status(200).json({
      success: true,
      data: transformedProducts.filter((p) => p !== null),
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

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const decryptedCategoryId = decryptData(categoryId);
    console.log("decryptedCategoryId", decryptedCategoryId);

    if (!mongoose.Types.ObjectId.isValid(decryptedCategoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const products = await Product.find({
      category_id: new mongoose.Types.ObjectId(decryptedCategoryId),
    })
      .select(
        "product_name product_slug product_imgs product_rating product_variants product_sold_quantity"
      )
      .populate({
        path: "category_id",
        select: "category_name",
      });

    const transformedProducts = products.map((product) => {
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
    console.error("Error in getProductsByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm theo danh mục.",
    });
  }
};

export const getProductsGroupedByCategory = async (req, res) => {
  try {
    const productsGrouped = await Product.aggregate([
      {
        $group: {
          _id: "$category_id", // Nhóm theo category_id
          productCount: { $sum: 1 }, // Đếm số lượng sản phẩm
        },
      },
      {
        $lookup: {
          from: "categories", // Tên collection chứa danh mục (categories)
          localField: "_id", // category_id từ sản phẩm
          foreignField: "_id", // _id từ danh mục
          as: "category", // Tên trường mới chứa thông tin danh mục
        },
      },
      {
        $unwind: "$category", // Giải phóng mảng danh mục thành object
      },
      {
        $project: {
          categoryId: "$_id", // Đặt lại tên cho _id là categoryId
          categoryName: "$category.category_name", // Lấy tên danh mục
          productCount: 1, // Số lượng sản phẩm
        },
      },
    ]);

    if (!productsGrouped.length) {
      return notFound(res, "Không có sản phẩm nào được tìm thấy.");
    }

    ok(res, productsGrouped, "Trả dữ liệu thành công");
  } catch (error) {
    console.error("Error in getProductsGroupedByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm theo nhóm danh mục.",
    });
  }
};
