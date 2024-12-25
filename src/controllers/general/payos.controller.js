import mongoose from "mongoose";
import payos from "../../libs/payOS.js";
import Order from "../../models/order.model.js";
import { decryptData } from "../../utils/security.js";
import crypto from "crypto";

// Hàm xử lý tạo liên kết thanh toán
export const createPaymentLink = async (req, res) => {
  try {
    // Lấy dữ liệu từ yêu cầu
    const paymentData = req.body;
    console.log("payyyyyyyyyy", paymentData);

    const finalCost =
      paymentData.order_products.reduce(
        (acc, curr) =>
          acc + curr.quantity + (curr.unit_price * (100 - curr.discount_percent)) / 100,
        0
      ) + 1000;

    // console.log("ddddddddd", paymentData.order_id.split(".")[0].slice(3));

    // Cấu trúc thông tin đơn hàng
    const order = {
      orderCode: Number(paymentData.order_id.split(".")[0].slice(3)),
      amount: finalCost,
      description: `Đơn hàng ${(paymentData.order_id.split(".") || ["unknow"])[0]}`,
      buyerName: paymentData.order_buyer.name,
      buyerPhone: paymentData.order_buyer.phone_number,
      buyerAddress: `${paymentData.order_buyer.address.street}, ${paymentData.order_buyer.address.ward}, ${paymentData.order_buyer.address.district}, ${paymentData.order_buyer.address.province}`,
      cancelUrl: paymentData.cancelUrl,
      returnUrl: paymentData.returnUrl,
    };
    // console.log("orderorder", order);

    // Gọi API PayOS để tạo liên kết thanh toán
    const paymentLink = await payos.createPaymentLink(order);
    // console.log("paymentLink", paymentLink);

    // Kiểm tra nếu không trả về liên kết
    if (!paymentLink || !paymentLink.checkoutUrl) {
      return res.status(500).json({ error: "Failed to generate payment link" });
    }

    const newOrder = new Order({
      ...paymentData,
      order_products: paymentData.order_products.map((product) => {
        // console.log("prooooooooo", product);
        return {
          ...product,
          product_id: new mongoose.Types.ObjectId(
            decryptData(decodeURIComponent(product.product_hashed_id))
          ),
        };
      }),
      final_cost: finalCost,
      paymentLink: paymentLink.checkoutUrl,
    });
    await newOrder.save();

    // Trả về chuỗi HTML chứa iframe
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment</title>
      </head>
      <body style="margin:0;padding:0;overflow:hidden;">
        <iframe src="${paymentLink.checkoutUrl}" frameborder="0" style="width:100%;height:100vh;border:none;"></iframe>
      </body>
      </html>
    `;

    // Gửi HTML tới client
    res.status(200).send(htmlContent);
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({ error: "An error occurred while creating the payment link" });
  }
};

export const handlePaymentWebhook = async (req, res) => {
  try {
    console.log("webhookData1", req.body);

    // Validate required fields
    if (!req.body || !req.body.data || !req.body.signature) {
      console.error("Invalid webhook data:", req.body);
      return res.status(400).json({ message: "Invalid webhook data" });
    }

    // Verify webhook signature
    let webhookData;
    try {
      webhookData = payos.verifyPaymentWebhookData(req.body);
    } catch (err) {
      console.error("Error verifying webhook signature:", err);
      return res.status(400).json({ message: "Invalid signature" });
    }

    console.log("webhookData2", webhookData);

    if (!webhookData) return res.status(400).json({ message: "Invalid webhook data" });

    const { success, data } = webhookData; // Extract data
    console.log("Webhook received:", webhookData);

    // Construct regex-based filter
    const orderFilter = { order_id: { $regex: data.orderCode, $options: "i" } };

    // Process order based on success
    const update = success ? { order_status: "delivering" } : { order_status: "unpaid" };

    const order = await Order.findOneAndUpdate(orderFilter, update, { new: true });

    if (!order) {
      console.error("Order not found for orderCode:", data.orderCode);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(success ? "Order updated successfully:" : "Order update failed:", order);
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Error processing webhook" });
  }
};