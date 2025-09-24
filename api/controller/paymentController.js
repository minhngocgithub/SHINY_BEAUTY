
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const crypto = require('crypto')
const Order = require('../models/order.models')
const User = require('../models/user.models')
const Product = require('../models/product.models')
const ProductBundle = require('../models/productBundle.models')
const Coupon = require('../models/coupon.models')
const axios = require('axios')
// ==================== MAIN ORDER CREATION WITH PAYMENT ====================

const createOrderWithPayment = async (req, res) => {
  try {
    const {
      cartItems,
      shippingAddress,
      paymentMethod, // 'COD', 'MOMO', 'ZALOPAY', 'STRIPE'
      couponCode,
      loyaltyPointsUsed = 0,
      note
    } = req.body;

    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    const validPaymentMethods = ['COD', 'MOMO', 'ZALOPAY', 'STRIPE'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Get user and validate loyalty points
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (loyaltyPointsUsed > user.loyaltyProfile?.points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient loyalty points'
      });
    }

    // Process cart items và tính toán pricing
    const processedItems = [];
    let itemsPrice = 0;

    for (const cartItem of cartItems) {
      if (cartItem.itemType === 'product' && cartItem.productId) {
        const product = await Product.findById(cartItem.productId);
        if (!product || product.countInstock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product?.name || 'product'}`
          });
        }

        const itemPrice = product.currentPrice || product.price;
        const itemTotal = itemPrice * cartItem.quantity;

        processedItems.push({
          itemType: 'product',
          product: product._id,
          name: product.name,
          quantity: cartItem.quantity,
          image: product.images?.[0]?.url || '',
          price: itemPrice
        });

        itemsPrice += itemTotal;

      } else if (cartItem.itemType === 'bundle' && cartItem.bundleId) {
        const bundle = await ProductBundle.findById(cartItem.bundleId);
        if (!bundle || !bundle.isActive) {
          return res.status(400).json({
            success: false,
            message: `Bundle ${bundle?.name || 'not found'} is not available`
          });
        }

        const stockCheck = await bundle.checkStock();
        if (!stockCheck.available) {
          return res.status(400).json({
            success: false,
            message: stockCheck.reason
          });
        }

        const itemTotal = bundle.bundlePrice * cartItem.quantity;

        processedItems.push({
          itemType: 'bundle',
          bundle: bundle._id,
          name: bundle.name,
          quantity: cartItem.quantity,
          image: bundle.image?.[0]?.url || '',
          price: bundle.bundlePrice,
          bundleItems: bundle.items.map(item => ({
            product: item.product,
            quantity: item.quantity * cartItem.quantity
          }))
        });

        itemsPrice += itemTotal;
      }
    }

    // Apply coupon discount
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expire: { $gt: new Date() }
      });

      if (coupon) {
        couponDiscount = (itemsPrice * coupon.discountPercentage) / 100;
      }
    }

    // Calculate pricing
    const shippingPrice = itemsPrice >= 500000 ? 0 : 30000; // Free ship trên 500k
    const taxPrice = itemsPrice * 0.1; // 10% VAT
    const loyaltyDiscount = loyaltyPointsUsed * 1000; // 1 point = 1000 VND
    const totalPrice = itemsPrice + shippingPrice + taxPrice - couponDiscount - loyaltyDiscount;

    // Create order data
    const orderData = {
      user: req.user._id,
      orderItems: processedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice: Math.max(0, totalPrice),
      loyaltyPointsUsed,
      loyaltyDiscount,
      couponCode,
      couponDiscount,
      note,
      status: 'PENDING'
    };

    // Handle different payment methods
    switch (paymentMethod) {
      case 'COD':
        return await handleCODPayment(orderData, res);
      case 'MOMO':
        return await handleMoMoPayment(orderData, req, res);
      case 'ZALOPAY':
        return await handleZaloPayment(orderData, req, res);
      case 'STRIPE':
        return await handleStripePayment(orderData, res);
      default:
        return res.status(400).json({
          success: false,
          message: 'Payment method not supported'
        });
    }

  } catch (error) {
    console.error('Create order with payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

// ==================== PAYMENT HANDLERS ====================

// COD Payment Handler
const handleCODPayment = async (orderData, res) => {
  try {
    orderData.paymentResult = {
      id: `COD-${Date.now()}`,
      status: 'PENDING',
      method: 'COD'
    };

    const order = new Order(orderData);
    await order.save();

    // Update stock
    await order.updateStock();

    // Clear user's cart
    await User.findByIdAndUpdate(orderData.user, { $set: { cartItems: [] } });

    res.status(201).json({
      success: true,
      message: 'Order created successfully with COD payment',
      order: {
        _id: order._id,
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        totalPrice: order.totalPrice,
        paymentMethod: 'COD',
        status: order.status
      }
    });

  } catch (error) {
    console.error('COD payment error:', error);
    throw error;
  }
};

// MoMo Payment Handler
const handleMoMoPayment = async (orderData, req, res) => {
  try {
    const order = new Order(orderData);
    await order.save();

    // MoMo API configuration (TEST MODE)
    const partnerCode = process.env.MOMO_PARTNER_CODE || 'MOMO_TEST';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'test_access_key';
    const secretKey = process.env.MOMO_SECRET_KEY || 'test_secret_key';
    const redirectUrl = `${process.env.FRONTEND_URL}/payment/momo/callback`;
    const ipnUrl = `${process.env.BACKEND_URL}/api/v1/payment/momo/webhook`;
    const orderId = order._id.toString();
    const requestId = orderId;
    const amount = Math.round(orderData.totalPrice);
    const orderInfo = `Payment for order ${orderId}`;
    const requestType = 'payWithATM';
    const extraData = '';

    // Create signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

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
      signature
    };

    // MOCK MoMo Response for Testing
    const mockMoMoResponse = {
      resultCode: 0,
      message: 'Success',
      payUrl: `https://test-payment.momo.vn/v2/gateway/pay?t=${orderId}`,
      deeplink: `momo://payment/${orderId}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${orderId}`
    };

    if (mockMoMoResponse.resultCode === 0) {
      order.paymentResult = {
        id: requestId,
        status: 'PENDING',
        method: 'MOMO',
        payUrl: mockMoMoResponse.payUrl
      };
      await order.save();

      res.status(200).json({
        success: true,
        message: 'MoMo payment URL created',
        paymentUrl: mockMoMoResponse.payUrl,
        deeplink: mockMoMoResponse.deeplink,
        qrCodeUrl: mockMoMoResponse.qrCodeUrl,
        orderId: order._id
      });
    } else {
      await Order.findByIdAndDelete(order._id);
      
      res.status(400).json({
        success: false,
        message: 'Failed to create MoMo payment',
        error: mockMoMoResponse.message
      });
    }

  } catch (error) {
    console.error('MoMo payment error:', error);
    throw error;
  }
};

// ZaloPay Payment Handler
const handleZaloPayment = async (orderData, req, res) => {
  try {
    const order = new Order(orderData);
    await order.save();

    // ZaloPay configuration (TEST MODE)
    const appId = process.env.ZALOPAY_APP_ID || 'test_app_id';
    const key1 = process.env.ZALOPAY_KEY1 || 'test_key1';
    const key2 = process.env.ZALOPAY_KEY2 || 'test_key2';
    
    const appTransId = `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}_${order._id}`;
    
    const orderZalo = {
      app_id: appId,
      app_trans_id: appTransId,
      app_user: req.user.email,
      app_time: Date.now(),
      amount: Math.round(orderData.totalPrice),
      description: `Payment for order ${order._id}`,
      bank_code: 'zalopayapp',
      item: JSON.stringify([{
        itemid: order._id.toString(),
        itemname: `Order ${order._id.toString().slice(-8)}`,
        itemprice: Math.round(orderData.totalPrice),
        itemquantity: 1
      }]),
      embed_data: JSON.stringify({
        redirecturl: `${process.env.FRONTEND_URL}/payment/zalopay/callback`
      }),
      callback_url: `${process.env.BACKEND_URL}/api/v1/payment/zalopay/webhook`
    };

    // MOCK ZaloPay Response for Testing
    const mockZaloResponse = {
      return_code: 1,
      return_message: 'Success',
      order_url: `https://sb-openapi.zalopay.vn/v2/gateway/pay?token=${appTransId}`,
      zp_trans_token: appTransId,
      qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${appTransId}`
    };

    // In production, uncomment this:
    // const zaloResponse = await axios.post('https://sb-openapi.zalopay.vn/v2/create', orderZalo);

    if (mockZaloResponse.return_code === 1) {
      order.paymentResult = {
        id: appTransId,
        status: 'PENDING',
        method: 'ZALOPAY',
        payUrl: mockZaloResponse.order_url
      };
      await order.save();

      res.status(200).json({
        success: true,
        message: 'ZaloPay payment URL created',
        paymentUrl: mockZaloResponse.order_url,
        qrCode: mockZaloResponse.qr_code,
        orderId: order._id
      });
    } else {
      await Order.findByIdAndDelete(order._id);
      
      res.status(400).json({
        success: false,
        message: 'Failed to create ZaloPay payment',
        error: mockZaloResponse.return_message
      });
    }

  } catch (error) {
    console.error('ZaloPay payment error:', error);
    throw error;
  }
};

// Stripe Payment Handler
const handleStripePayment = async (orderData, res) => {
  try {
    const order = new Order(orderData);
    await order.save();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: orderData.orderItems.map(item => ({
        price_data: {
          currency: 'vnd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price), // VND doesn't use cents
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId: orderData.user.toString()
      }
    });

    order.paymentResult = {
      id: session.id,
      status: 'PENDING',
      method: 'STRIPE',
      payUrl: session.url
    };
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Stripe payment session created',
      paymentUrl: session.url,
      sessionId: session.id,
      orderId: order._id
    });

  } catch (error) {
    console.error('Stripe payment error:', error);
    throw error;
  }
};

// ==================== WEBHOOK HANDLERS ====================

// MoMo Webhook
const handleMoMoWebhook = async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (resultCode === 0) {
      // Payment successful
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'CONFIRMED';
      order.paymentResult.status = 'PAID';
      await order.save();

      // Clear user's cart
      await User.findByIdAndUpdate(order.user, { $set: { cartItems: [] } });
    } else {
      // Payment failed
      order.status = 'CANCELLED';
      order.paymentResult.status = 'FAILED';
      await order.save();
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('MoMo webhook error:', error);
    res.status(500).json({ success: false });
  }
};

// ZaloPay Webhook
const handleZaloPayWebhook = async (req, res) => {
  try {
    const { data, mac } = req.body;
    
    // Verify signature
    const key2 = process.env.ZALOPAY_KEY2 || 'test_key2';
    const computedMac = crypto.createHmac('sha256', key2).update(data).digest('hex');
    
    if (mac !== computedMac) {
      return res.status(400).json({ return_code: -1, return_message: 'Invalid signature' });
    }

    const dataObj = JSON.parse(data);
    const orderId = dataObj.app_trans_id.split('_')[1];
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ return_code: 0, return_message: 'success' });
    }

    // Payment successful
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'CONFIRMED';
    order.paymentResult.status = 'PAID';
    await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(order.user, { $set: { cartItems: [] } });

    res.json({ return_code: 1, return_message: 'success' });

  } catch (error) {
    console.error('ZaloPay webhook error:', error);
    res.json({ return_code: 0, return_message: 'success' });
  }
};

// Stripe Webhook
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'CONFIRMED';
      order.paymentResult.status = 'PAID';
      order.paymentResult.transactionId = session.payment_intent;
      await order.save();

      // Clear user's cart
      await User.findByIdAndUpdate(order.user, { $set: { cartItems: [] } });
    }
  }

  res.json({ received: true });
};

// ==================== VERIFICATION METHODS ====================

// Verify Stripe Payment
const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata.orderId;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (session.payment_status === 'paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'CONFIRMED';
      order.paymentResult.status = 'PAID';
      order.paymentResult.transactionId = session.payment_intent;
      await order.save();

      await User.findByIdAndUpdate(order.user, { $set: { cartItems: [] } });

      res.json({ 
        success: true, 
        status: 'paid',
        order 
      });
    } else {
      res.json({ 
        success: false, 
        status: session.payment_status 
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== UTILITY METHODS ====================

const getPaymentMethods = async (req, res) => {
  try {
    const methods = [
      {
        id: 'stripe',
        name: 'Thẻ tín dụng/Ghi nợ',
        icon: 'credit-card',
        description: 'Visa, Mastercard, American Express',
        enabled: true
      },
      {
        id: 'momo',
        name: 'MoMo',
        icon: 'momo',
        description: 'Ví điện tử MoMo',
        enabled: true
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        icon: 'zalopay', 
        description: 'Ví điện tử ZaloPay',
        enabled: true
      },
      {
        id: 'cod',
        name: 'Thanh toán khi nhận hàng',
        icon: 'cash',
        description: 'Trả tiền mặt khi nhận hàng',
        enabled: true
      }
    ];

    res.json({ success: true, methods });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      orderId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentResult?.status,
      transactionId: order.paymentResult?.transactionId,
      isPaid: order.isPaid
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrderWithPayment,
  handleCODPayment,
  handleMoMoPayment, 
  handleZaloPayment,
  handleStripePayment,
  handleMoMoWebhook,
  handleZaloPayWebhook,
  handleStripeWebhook,
  verifyStripePayment,
  getPaymentMethods,
  getPaymentStatus
}