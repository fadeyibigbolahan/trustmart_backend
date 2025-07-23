const Order = require("../../models/Order");
const axios = require("axios");
const paystack = require("paystack-api")(process.env.PAYSTACK_SECRET_KEY);
const User = require("../../models/User");
const Cart = require("../../models/Cart");
const Address = require("../../models/Address");
const Vendor = require("../../models/Vendor");
const Product = require("../../models/Product");

const initiatePaystackPayment = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const {
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
    } = req.body;

    // 🔎 Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    // 💰 Validate amount
    const totalAmountInKobo = Math.round(totalAmount * 100);
    if (!totalAmountInKobo || totalAmountInKobo <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Must be greater than zero.",
      });
    }

    // 🚀 Initialize Paystack transaction (without split)
    const response = await paystack.transaction.initialize({
      email: user.email,
      amount: totalAmountInKobo,
      callback_url: `${process.env.CLIENT_URL}/order/success`,
      metadata: {
        userId,
        cartId,
        cartItems,
        addressInfo,
        paymentMethod,
        paymentStatus,
        orderStatus,
        totalAmount,
        orderDate,
        orderUpdateDate,
      },
    });

    res.status(200).json({
      success: true,
      authorization_url: response.data.authorization_url,
    });
  } catch (error) {
    console.error(
      "Paystack Init Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
};

const verifyPaystackPayment = async (req, res) => {
  try {
    const {
      reference,
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    // 1. Verify payment
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status === "success") {
      // 2. Create the order
      const newOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: orderStatus || "processing",
        paymentMethod: paymentMethod || "Paystack",
        paymentStatus: "Paid",
        totalAmount,
        orderDate,
        orderUpdateDate,
        paymentId: paymentData.id,
        payerId: paymentData.customer?.email || "",
      });

      await newOrder.save();

      // 3. Credit vendor wallets
      for (let item of cartItems) {
        const product = await Product.findById(item.productId).populate(
          "vendor"
        );
        const vendor = product?.vendor;

        if (vendor) {
          const totalItemAmount = item.quantity * item.price;
          const vendorEarning = totalItemAmount * 0.9; // 90% to vendor

          vendor.balance = (vendor.balance || 0) + vendorEarning;
          await vendor.save();
        }
      }

      return res.status(201).json({
        success: true,
        message: "Payment verified, order created, vendor(s) credited",
        orderId: newOrder._id,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Paystack verification failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred during verification",
    });
  }
};

const verifyOrderViaQuery = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Reference is required",
      });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status === "success") {
      const metadata = paymentData.metadata;

      let order = await Order.findOne({ paymentId: paymentData.id });

      if (!order) {
        order = new Order({
          userId: metadata.userId,
          cartItems: metadata.cartItems,
          addressInfo: metadata.addressInfo,
          orderStatus: "Processing",
          paymentMethod: metadata.paymentMethod || "Paystack",
          paymentStatus: "Paid",
          totalAmount: metadata.totalAmount,
          orderDate: metadata.orderDate,
          orderUpdateDate: metadata.orderUpdateDate,
          paymentId: paymentData.id,
          payerId: paymentData.customer?.email || "",
        });

        await order.save();

        // Clear cart after successful order
        await Cart.findOneAndUpdate(
          { userId: metadata.userId },
          { $set: { items: [] } }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful",
      });
    }
  } catch (error) {
    console.error("Order verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error verifying order",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  initiatePaystackPayment,
  verifyPaystackPayment,
  getAllOrdersByUser,
  getOrderDetails,
  verifyOrderViaQuery,
};
