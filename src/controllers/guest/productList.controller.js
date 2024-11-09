import Product from "../../models/product.model.js";
import { notFound, ok, error } from "../../handlers/respone.handler.js";
import { encryptData } from "../../utils/security.js";

export const getNewestProducts = async (req, res, next) => {
  try {
    const newestProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select(
        "product_name category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate("category_id", "name");

    const transformedProducts = newestProducts.map((product) => {
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

      // Add variant names list
      const variantNames = product.product_variants.map((variant) => variant.variant_name);

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
        product_price: lowestPriceVariant.variant_price,
        highest_discount: highestDiscountVariant
          ? highestDiscountVariant.variant_discount_percent
          : null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id.name,
        variant_id: lowestPriceVariant._id,
        variant_name: lowestPriceVariant.variant_name,
        variant_slug: lowestPriceVariant.variant_slug,
        variant_names: variantNames, // List of variant names
      };
    });

    ok(res, transformedProducts, "Trả dữ liệu thành công");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm mới nhất.",
    });
  }
};

export const getTopRatedProducts = async (req, res, next) => {
  try {
    const topRatedProducts = await Product.find()
      .sort({ product_rating: -1, product_sold_quantity: -1 })
      .limit(10)
      .select(
        "product_name category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate("category_id", "name");

    const transformedProducts = topRatedProducts.map((product) => {
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

      // Add variant names list
      const variantNames = product.product_variants.map((variant) => variant.variant_name);

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
        product_price: lowestPriceVariant.variant_price,
        highest_discount: highestDiscountVariant
          ? highestDiscountVariant.variant_discount_percent
          : null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id.name,
        variant_id: lowestPriceVariant._id,
        variant_name: lowestPriceVariant.variant_name,
        variant_slug: lowestPriceVariant.variant_slug,
        variant_names: variantNames, // List of variant names
      };
    });

    ok(res, transformedProducts, "Trả dữ liệu thành công");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm có đánh giá cao nhất.",
    });
  }
};

export const getDiscountProducts = async (req, res, next) => {
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
      .populate("category_id", "name");

    const transformedProducts = discountProducts.map((product) => {
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

      // Add variant names list
      const variantNames = product.product_variants.map((variant) => variant.variant_name);

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
        product_price: lowestPriceVariant.variant_price,
        highest_discount: highestDiscountVariant
          ? highestDiscountVariant.variant_discount_percent
          : null,
        product_sold_quantity: product.product_sold_quantity,
        category_name: product.category_id.name,
        variant_id: lowestPriceVariant._id,
        variant_name: lowestPriceVariant.variant_name,
        variant_slug: lowestPriceVariant.variant_slug,
        variant_names: variantNames, // List of variant names
      };
    });

    ok(res, transformedProducts, "Trả dữ liệu thành công");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi lấy sản phẩm có giảm giá.",
    });
  }
};

export const getSearchRecommended = async (req, res) => {
  try {
    let { searchKey } = req.query;
    let searchConditions = {};

    if (searchKey) {
      searchConditions.$or = [
        { product_name: { $regex: searchKey, $options: "i" } },
        { product_slug: { $regex: searchKey.replace(/\s+/g, "-"), $options: "i" } },
        { "category_id.name": { $regex: searchKey, $options: "i" } },
        { product_description: { $regex: searchKey, $options: "i" } },
        { "product_variants.variant_name": { $regex: searchKey, $options: "i" } },
      ];
    }

    const products = await Product.find(searchConditions)
      .limit(4)
      .select(
        "product_name product_description category_id product_imgs product_rating product_variants product_sold_quantity product_slug"
      )
      .populate("category_id", "name");

    const transformedProducts = products.map((product) => {
      const lowestPriceVariant = product.product_variants.reduce((minPriceVariant, variant) => {
        const discountedPrice =
          (variant.variant_price * (100 - variant.variant_discount_percent)) / 100;
        if (!minPriceVariant || discountedPrice < minPriceVariant.discountedPrice) {
          minPriceVariant = { discountedPrice, price: variant.variant_price, ...variant };
        }
        return minPriceVariant;
      }, null);

      // Add variant names list
      const variantNames = product.product_variants.map((variant) => variant.variant_name);

      return {
        product_id_hashed: encryptData(product._id),
        product_name: product.product_name,
        product_slug: product.product_slug,
        product_img: product.product_imgs[0],
        product_price: lowestPriceVariant.price,
        lowest_price: lowestPriceVariant.discountedPrice,
        variant_id: lowestPriceVariant._id,
        variant_name: lowestPriceVariant.variant_name,
        variant_slug: lowestPriceVariant.variant_slug,
        variant_names: variantNames,
      };
    });

    ok(res, { searchKey, recommendedProducts: transformedProducts }, "Trả dữ liệu thành công");
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi tìm kiếm sản phẩm." });
  }
};

// Controller tìm kiếm + bộ lọc kết quả tìm kiếm
export const search = async (req, res) => {
  try {
    let { searchKey, category, rating, minPrice, maxPrice, sortBy, discount, page } = req.query;
    const perPage = 20;
    const pageNumber = parseInt(page) || 1;

    let searchConditions = {};

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

    if (category) {
      searchConditions["category_id"] = category;
    }

    if (rating) {
      const minRating = parseFloat(rating) - 0.2;
      const maxRating = parseFloat(rating) + 0.99;
      searchConditions["product_rating.rating_point"] = { $gte: minRating, $lt: maxRating };
    }

    if (minPrice && maxPrice) {
      searchConditions["product_variants.variant_price"] = { $gte: minPrice, $lte: maxPrice };
    }

    if (discount) {
      searchConditions["product_variants.variant_discount_percent"] = { $gt: 0 };
    }

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

    const totalProducts = await Product.countDocuments(searchConditions);
    const totalPages = Math.ceil(totalProducts / perPage);
    const skip = (pageNumber - 1) * perPage;

    // Sử dụng select với các trường có trong mô hình Product
    let products = await Product.find(searchConditions)
      .sort(sortOptions)
      .skip(skip)
      .limit(perPage)
      .select(
        "product_name product_slug product_imgs product_short_description product_description product_sold_quantity product_specifications category_id product_variants product_rating.rating_point product_rating.rating_count review_count"
      ) // Chọn các trường tồn tại trong mô hình Product
      .populate("category_id", "category_name"); // Giả định category_id là một đối tượng với trường `name`

    const transformedProducts = products.map((product) => {
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
        product_id_hashed: encryptData(product._id),
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
