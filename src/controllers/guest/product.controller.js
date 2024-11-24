import Product from "../../models/product.model.js";
import { ok } from "../../handlers/respone.handler.js";

// // [GET] / api/guest/products/getProducts
// export const getProducts = async (req, res, next) => {
//   try {
//     return ok(res, { products: "guest product" });
//   } catch (err) {
//     console.log("Err: " + err);
//   }
// };


// [GET] /api/guest/products/getProducts
export const getProducts = async (req, res, next) => {
  try {
    const { 
      sort = "latest",  // latest | rating
      page = 1, 
      limit = 12,
      category_id
    } = req.query;

    // Xây dựng query cơ bản
    let query = {};
    
    // Thêm filter theo category nếu có
    if (category_id) {
      query.categories = category_id;
    }

    // Xác định cách sắp xếp
    let sortOption = {};
    switch (sort) {
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      case "rating":
        sortOption = { product_avg_rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category_info"
        }
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$productId", "$order_products.product_id"]
                }
              }
            },
            {
              $unwind: "$order_products"
            },
            {
              $match: {
                $expr: {
                  $eq: ["$order_products.product_id", "$$productId"]
                }
              }
            },
            {
              $group: {
                _id: null,
                total_sold: { $sum: "$order_products.quantity" }
              }
            }
          ],
          as: "order_stats"
        }
      },
      {
        $addFields: {
          product_avg_rating: {
            $cond: [
              { $eq: ["$product_rating.rating_count", 0] },
              0,
              { $divide: ["$product_rating.rating_point", "$product_rating.rating_count"] }
            ]
          },
          highest_discount: {
            $max: "$product_variants.variant_discount_percent"
          },
          product_sold_quantity: {
            $cond: {
              if: { $gt: [{ $size: "$order_stats" }, 0] },
              then: { $arrayElemAt: ["$order_stats.total_sold", 0] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          product_name: 1,
          product_slug: 1,
          product_imgs: { $arrayElemAt: ["$product_imgs", 0] },
          product_avg_rating: 1,
          product_short_description: 1,
          highest_discount: 1,
          product_sold_quantity: 1,
          category: {
            _id: { $arrayElemAt: ["$category_info._id", 0] },
            name: { $arrayElemAt: ["$category_info.category_name", 0] }
          },
          product_variants: {
            $map: {
              input: "$product_variants",
              as: "variant",
              in: {
                variant_name: "$$variant.variant_name",
                variant_slug: "$$variant.variant_slug",
                variant_price: "$$variant.variant_price",
                variant_discount_percent: "$$variant.variant_discount_percent",
                discounted_price: {
                  $subtract: [
                    "$$variant.variant_price",
                    {
                      $multiply: [
                        "$$variant.variant_price",
                        { $divide: ["$$variant.variant_discount_percent", 100] }
                      ]
                    }
                  ]
                }
              }
            }
          },
          createdAt: 1
        }
      },
      { $sort: sortOption },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    // Đếm tổng số sản phẩm để phân trang
    const totalProducts = await Product.countDocuments(query);

    return ok(res, {
      products,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalProducts / limit),
        total_items: totalProducts,
        items_per_page: parseInt(limit)
      }
    });

  } catch (err) {
    console.log("Err: " + err);
    return error(res);
  }
};