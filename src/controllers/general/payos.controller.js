import payos from "../../libs/payOS.js";

// Hàm xử lý tạo liên kết thanh toán
export const createPaymentLink = async (req, res) => {
  try {
    // Lấy dữ liệu từ yêu cầu
    const { cancelUrl, returnUrl, buyerInfo, amount } = req.body;

    // console.log("reqqqqq.body", req.body);
    // console.log("booooooo", cancelUrl, returnUrl, buyerInfo, amount);
    // Kiểm tra dữ liệu đầu vào
    if (!cancelUrl || !returnUrl || !buyerInfo || !amount) {
      console.log("testtt");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Cấu trúc thông tin đơn hàng
    const orderCode = Date.now();
    const order = {
      orderCode,
      amount: amount,
      description: `Đơn hàng ${orderCode}`,
      buyerName: buyerInfo.buyerName,
      buyerPhone: buyerInfo.buyerPhone,
      buyerAddress: `${buyerInfo.buyerAddress.street}, ${buyerInfo.buyerAddress.ward}, ${buyerInfo.buyerAddress.district}, ${buyerInfo.buyerAddress.province}`,
      cancelUrl,
      returnUrl,
    };
    // console.log("orderorder", order);

    // Gọi API PayOS để tạo liên kết thanh toán
    const paymentLink = await payos.createPaymentLink(order);
    // console.log("paymentLink", paymentLink);

    // Kiểm tra nếu không trả về liên kết
    if (!paymentLink || !paymentLink.checkoutUrl) {
      return res.status(500).json({ error: "Failed to generate payment link" });
    }

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
