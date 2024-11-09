import Order from "../../models/order.model.js";
import { ok, error, notFound } from "../../handlers/respone.handler.js";
import mongoose from "mongoose";

// [GET] /api/orders
export const getOrders = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { 
      status,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10 
    } = req.query;

    let query = { user_id: user_id };
    if (status) {
      query.order_status = status;
    }

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const orders = await Order.aggregate([
      { $match: query },
      // Unwind order_products để xử lý từng sản phẩm
      {
        $unwind: "$order_products"
      },
      // Lookup để lấy thông tin product
      {
        $lookup: {
          from: "products",
          let: { 
            productId: { $toObjectId: "$order_products.product_id" },
            variantId: { $toObjectId: "$order_products.variant_id" }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] }
              }
            },
            {
              $project: {
                _id: 1,
                product_name: 1,
                product_imgs: { $arrayElemAt: ["$product_imgs", 0] },
                variant: {
                  $arrayElemAt: [{
                    $filter: {
                      input: "$product_variants",
                      as: "v",
                      cond: { $eq: ["$$v._id", "$$variantId"] }
                    }
                  }, 0]
                }
              }
            }
          ],
          as: "product_info"
        }
      },
      // Thêm thông tin product vào order_products
      {
        $addFields: {
          "order_products.product_name": { 
            $arrayElemAt: ["$product_info.product_name", 0] 
          },
          "order_products.product_img": { 
            $arrayElemAt: ["$product_info.product_imgs", 0] 
          },
          "order_products.variant_name": { 
            $arrayElemAt: ["$product_info.variant.variant_name", 0] 
          },
          "order_products.variant_img": { 
            $arrayElemAt: ["$product_info.variant.variant_img", 0] 
          }
        }
      },
      // Group lại để khôi phục cấu trúc order ban đầu
      {
        $group: {
          _id: "$_id",
          user_id: { $first: "$user_id" },
          order_buyer: { $first: "$order_buyer" },
          order_note: { $first: "$order_note" },
          total_products_cost: { $first: "$total_products_cost" },
          shipping_cost: { $first: "$shipping_cost" },
          final_cost: { $first: "$final_cost" },
          order_status: { $first: "$order_status" },
          createdAt: { $first: "$createdAt" },
          order_products: { 
            $push: {
              product_id: "$order_products.product_id",
              variant_id: "$order_products.variant_id",
              quantity: "$order_products.quantity",
              unit_price: "$order_products.unit_price",
              discount_percent: "$order_products.discount_percent",
              product_name: "$order_products.product_name",
              product_img: "$order_products.product_img",
              variant_name: "$order_products.variant_name",
              variant_img: "$order_products.variant_img"
            }
          }
        }
      },
      // Sort và phân trang
      { $sort: sortObj },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    // Đếm tổng số orders
    const total = await Order.countDocuments(query);

    return ok(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.log("Error:", err);
    return error(res, "Internal server error");
  }
};
// [GET] /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const orderId = new mongoose.Types.ObjectId(id);
    
    const order = await Order.aggregate([
      { 
        $match: { 
          _id: orderId,
          user_id: user_id
        }
      },
      // Unwind order_products để xử lý từng sản phẩm
      {
        $unwind: "$order_products"
      },
      // Lookup để lấy thông tin product
      {
        $lookup: {
          from: "products",
          let: { 
            productId: { $toObjectId: "$order_products.product_id" },
            variantId: { $toObjectId: "$order_products.variant_id" }
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] }
              }
            },
            {
              $project: {
                _id: 1,
                product_name: 1,
                product_imgs: { $arrayElemAt: ["$product_imgs", 0] },
                variant: {
                  $arrayElemAt: [{
                    $filter: {
                      input: "$product_variants",
                      as: "v",
                      cond: { $eq: ["$$v._id", "$$variantId"] }
                    }
                  }, 0]
                }
              }
            }
          ],
          as: "product_info"
        }
      },
      // Thêm thông tin product vào order_products
      {
        $addFields: {
          "order_products.product_name": { 
            $arrayElemAt: ["$product_info.product_name", 0] 
          },
          "order_products.product_img": { 
            $arrayElemAt: ["$product_info.product_imgs", 0] 
          },
          "order_products.variant_name": { 
            $arrayElemAt: ["$product_info.variant.variant_name", 0] 
          },
          "order_products.variant_img": { 
            $arrayElemAt: ["$product_info.variant.variant_img", 0] 
          }
        }
      },
      // Group lại để khôi phục cấu trúc order ban đầu
      {
        $group: {
          _id: "$_id",
          user_id: { $first: "$user_id" },
          order_buyer: { $first: "$order_buyer" },
          order_note: { $first: "$order_note" },
          total_products_cost: { $first: "$total_products_cost" },
          shipping_cost: { $first: "$shipping_cost" },
          final_cost: { $first: "$final_cost" },
          order_status: { $first: "$order_status" },
          createdAt: { $first: "$createdAt" },
          order_products: { 
            $push: {
              product_id: "$order_products.product_id",
              variant_id: "$order_products.variant_id",
              quantity: "$order_products.quantity",
              unit_price: "$order_products.unit_price",
              discount_percent: "$order_products.discount_percent",
              product_name: "$order_products.product_name",
              product_img: "$order_products.product_img",
              variant_name: "$order_products.variant_name",
              variant_img: "$order_products.variant_img"
            }
          }
        }
      }
    ]);

    if (!order || order.length === 0) {
      return notFound(res, "Order not found");
    }

    // Log để debug
    console.log("Found order:", JSON.stringify(order[0], null, 2));

    return ok(res, { order: order[0] });

  } catch (err) {
    console.log("Error:", err);
    if (err.name === 'CastError') {
      return error(res, "Invalid order ID");
    }
    return error(res, "Internal server error");
  }
};
