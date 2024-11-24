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
          localField: "categories",
          foreignField: "_id",
          as: "category_info"
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
          category_names: 1,
          product_variants: {
            $map: {
              input: "$product_variants",
              as: "variant",
              in: {
                variant_name: "$$variant.variant_name",
                price: "$$variant.price",
                discount_amount: "$$variant.discount_amount",
                variant_slug: "$$variant.variant_slug"
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