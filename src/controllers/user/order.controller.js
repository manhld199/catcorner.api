import Order from "../../models/order.model.js";
import { ok, error, notFound, badRequest } from "../../handlers/respone.handler.js";
import mongoose from "mongoose";

// [GET] /api/orders
export const getOrders = async (req, res) => {
  try {
    const user_id = req.user?.user_id; // Lấy user_id từ request
    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const {
      status,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
      product_name = "",
      order_id = "",
      phone_number = "",
    } = req.query;

    // Kiểm tra và chuyển đổi user_id sang ObjectId
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ success: false, message: "Invalid User ID." });
    }

    let query = { user_id: new mongoose.Types.ObjectId(user_id) }; // Dùng 'new' để tạo ObjectId hợp lệ

    // Thêm bộ lọc theo trạng thái
    if (status) {
      query.order_status = status;
    }

    // Thêm bộ lọc theo order_id
    if (order_id) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: order_id,
          options: "i",
        },
      };
    }

    // Thêm bộ lọc theo số điện thoại
    if (phone_number) {
      query["order_buyer.phone_number"] = phone_number;
    }

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    // Aggregation pipeline
    const orders = await Order.aggregate([
      { $match: query },
      // Unwind order_products để xử lý từng sản phẩm
      { $unwind: "$order_products" },
      // Lookup để lấy thông tin product
      {
        $lookup: {
          from: "products",
          let: {
            productId: { $toObjectId: "$order_products.product_id" },
            variantId: { $toObjectId: "$order_products.variant_id" },
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
              },
            },
            {
              $project: {
                _id: 1,
                product_name: 1,
                product_imgs: { $arrayElemAt: ["$product_imgs", 0] },
                variant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$product_variants",
                        as: "v",
                        cond: { $eq: ["$$v._id", "$$variantId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
          as: "product_info",
        },
      },
      // Lọc sản phẩm theo product_name
      ...(product_name
        ? [
            {
              $match: {
                "product_info.product_name": {
                  $regex: product_name,
                  $options: "i",
                },
              },
            },
          ]
        : []),
      // Thêm thông tin product vào order_products
      {
        $addFields: {
          "order_products.product_name": {
            $arrayElemAt: ["$product_info.product_name", 0],
          },
          "order_products.product_img": {
            $arrayElemAt: ["$product_info.product_imgs", 0],
          },
          "order_products.variant_name": {
            $arrayElemAt: ["$product_info.variant.variant_name", 0],
          },
          "order_products.variant_img": {
            $arrayElemAt: ["$product_info.variant.variant_img", 0],
          },
        },
      },
      // Gom nhóm lại
      {
        $group: {
          _id: "$_id",
          order_id: { $first: "$order_id" },
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
              variant_img: "$order_products.variant_img",
            },
          },
        },
      },
      // Sort và phân trang
      { $sort: sortObj },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    // Đếm tổng số orders phù hợp với điều kiện filter
    const total = await Order.aggregate([
      { $match: query },
      { $unwind: "$order_products" },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$order_products.product_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
              },
            },
          ],
          as: "product_info",
        },
      },
      ...(product_name
        ? [
            {
              $match: {
                "product_info.product_name": {
                  $regex: product_name,
                  $options: "i",
                },
              },
            },
          ]
        : []),
      { $group: { _id: "$_id" } },
      { $count: "total" },
    ]);

    const totalCount = total.length > 0 ? total[0].total : 0;

    // Trả về dữ liệu
    return res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          total_pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (err) {
    console.error("Error in getOrders API:", err); // Log lỗi chi tiết
    return res.status(500).json({ success: false, message: "Internal server error" });
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
          user_id: user_id,
        },
      },
      // Unwind order_products để xử lý từng sản phẩm
      {
        $unwind: "$order_products",
      },
      // Lookup để lấy thông tin product
      {
        $lookup: {
          from: "products",
          let: {
            productId: { $toObjectId: "$order_products.product_id" },
            variantId: { $toObjectId: "$order_products.variant_id" },
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
              },
            },
            {
              $project: {
                _id: 1,
                product_name: 1,
                product_imgs: { $arrayElemAt: ["$product_imgs", 0] },
                variant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$product_variants",
                        as: "v",
                        cond: { $eq: ["$$v._id", "$$variantId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
          as: "product_info",
        },
      },
      // Thêm thông tin product vào order_products
      {
        $addFields: {
          "order_products.product_name": {
            $arrayElemAt: ["$product_info.product_name", 0],
          },
          "order_products.product_img": {
            $arrayElemAt: ["$product_info.product_imgs", 0],
          },
          "order_products.variant_name": {
            $arrayElemAt: ["$product_info.variant.variant_name", 0],
          },
          "order_products.variant_img": {
            $arrayElemAt: ["$product_info.variant.variant_img", 0],
          },
        },
      },
      // Group lại để khôi phục cấu tr��c order ban đầu
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
              variant_img: "$order_products.variant_img",
            },
          },
        },
      },
    ]);

    if (!order || order.length === 0) {
      return notFound(res, "Order not found");
    }

    // Log để debug
    console.log("Found order:", JSON.stringify(order[0], null, 2));

    return ok(res, { order: order[0] });
  } catch (err) {
    console.log("Error:", err);
    if (err.name === "CastError") {
      return error(res, "Invalid order ID");
    }
    return error(res, "Internal server error");
  }
};

// [GET] /api/orders/track
export const trackOrder = async (req, res) => {
  try {
    const { order_id, phone_number } = req.query;

    // Kiểm tra đầu vào
    if (!order_id || !phone_number) {
      return res.status(400).json({ message: "Order ID và số điện thoại là bắt buộc" });
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    // Xây dựng biểu thức regex cho order_id
    const orderIdPattern = `^#${order_id}\\..*${phone_number}.*`;

    const order = await Order.aggregate([
      {
        $match: {
          order_id: { $regex: orderIdPattern, $options: "i" }, // Khớp regex không phân biệt chữ hoa/thường
        },
      },
      {
        $unwind: "$order_products", // Phân rã order_products để xử lý từng sản phẩm
      },
      {
        $lookup: {
          from: "products",
          let: {
            productId: { $toObjectId: "$order_products.product_id" },
            variantId: { $toObjectId: "$order_products.variant_id" },
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
              },
            },
            {
              $project: {
                _id: 1,
                product_name: 1,
                product_imgs: { $arrayElemAt: ["$product_imgs", 0] },
                variant: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$product_variants",
                        as: "v",
                        cond: { $eq: ["$$v._id", "$$variantId"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
          as: "product_info",
        },
      },
      {
        $addFields: {
          "order_products.product_name": { $arrayElemAt: ["$product_info.product_name", 0] },
          "order_products.product_img": { $arrayElemAt: ["$product_info.product_imgs", 0] },
          "order_products.variant_name": {
            $arrayElemAt: ["$product_info.variant.variant_name", 0],
          },
          "order_products.variant_img": { $arrayElemAt: ["$product_info.variant.variant_img", 0] },
          "order_products.total_price": {
            $multiply: ["$order_products.unit_price", "$order_products.quantity"],
          }, // Tính tổng giá tiền cho mỗi sản phẩm
        },
      },
      {
        $group: {
          _id: "$_id",
          order_buyer: { $first: "$order_buyer" },
          order_note: { $first: "$order_note" },
          total_products_cost: { $sum: "$order_products.total_price" },
          shipping_cost: { $first: "$shipping_cost" },
          final_cost: {
            $first: {
              $add: ["$shipping_cost", "$final_cost"],
            },
          },
          payment_method: { $first: "$payment_method" },
          applied_coupons: { $first: "$applied_coupons" },
          order_status: { $first: "$order_status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
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
              variant_img: "$order_products.variant_img",
              total_price: "$order_products.total_price", // Tổng giá của từng sản phẩm
            },
          },
        },
      },
    ]);

    // console.log("aaaaaaaaaaaaaaaaaaaaaa", order);

    if (!order || order.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    return res.status(200).json({ order: order[0] });
  } catch (err) {
    console.error("Lỗi khi tra cứu đơn hàng:", err);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
