const mongoose = require("mongoose");
const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/OrderModel");

// ✅ SECURITY FIX: Load từ environment variables thay vì hardcode
const partnerCode = process.env.MOMO_PARTNER_CODE;
const accessKey = process.env.MOMO_ACCESS_KEY;
const secretKey = process.env.MOMO_SECRET_KEY;
const redirectUrl = process.env.MOMO_REDIRECT_URL || "http://localhost:5173/orders-success"; // fixed typo: susscess -> success
const ipnUrl = process.env.MOMO_IPN_URL;

// Validate required environment variables at startup
if (!partnerCode || !accessKey || !secretKey || !redirectUrl || !ipnUrl) {
  console.error("❌ ERROR: Missing MOMO configuration in environment variables");
  console.error("Required: MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, MOMO_REDIRECT_URL, MOMO_IPN_URL");
  process.exit(1);
}

// =======================
// 1️⃣ Tạo yêu cầu thanh toán MoMo
// =======================
const createPayment = async (req, res) => {
  try {
    const {
      amount: rawAmount,
      orderInfo,
      customer,
      branch,
      service,
      province,
      district,
      ward,
      detailAddress,
      notes,
      pricingType,
      scheduledAt,
      startTime,
      endTime,
    } = req.body;

    const amount = Math.round(rawAmount);
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const requestType = "captureWallet";

    const extraDataObj = {
      customer,
      branch,
      service,
      province,
      district,
      ward,
      detailAddress,
      notes,
      pricingType,
      scheduledAt,
      startTime,
      endTime,
    };
    const extraData = Buffer.from(JSON.stringify(extraDataObj)).toString("base64");

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto.createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
      lang: "vi",
    };

    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody
    );

    return res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo thanh toán MoMo", error: err.message });
  }
};

// =======================
// 2️⃣ Callback khi thanh toán MoMo thành công
// =======================
const callback = async (req, res) => {
  try {
    const data = req.body;
    console.log("🟣 MoMo Callback:", data);

    if (data.resultCode === 0) {
      let extra = {};
      if (data.extraData) {
        extra = JSON.parse(Buffer.from(data.extraData, "base64").toString());
      }

      const customerId = mongoose.Types.ObjectId.isValid(extra.customer) ? extra.customer : null;
      const serviceId = mongoose.Types.ObjectId.isValid(extra.service) ? extra.service : null;
      const branchId = mongoose.Types.ObjectId.isValid(extra.branch) ? extra.branch : null;

      await Order.create({
        customer: customerId,
        service: serviceId,
        branch: branchId,
        province: extra.province || "",
        district: extra.district || "",
        ward: extra.ward || "",
        detailAddress: extra.detailAddress || "Chưa có địa chỉ",
        notes: extra.notes || "",
        pricingType: extra.pricingType || "Theo giờ",
        scheduledAt: extra.scheduledAt ? new Date(extra.scheduledAt) : new Date(),
        startTime: extra.startTime ? new Date(extra.startTime) : null,
        endTime: extra.endTime ? new Date(extra.endTime) : null,
        price: data.amount,
        paymentMethod: "Thanh toán Momo",
        paymentStatus: "paid",
        status: "pending",
      });

      console.log("✅ Đơn hàng đã được tạo thành công qua MoMo!");
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Lỗi callback MoMo:", err);
    res.status(500).send("Error");
  }
};

module.exports = {
  createPayment,
  callback,
};
