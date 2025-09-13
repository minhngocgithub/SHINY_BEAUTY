const Coupon = require('../models/coupon.models')
const Order = require('../models/order.models')
const Stripe = require('../utils/stripe')

const createCheckoutSession = async(req, res) => {
    try {
        const { orderItems, couponCode } = req.body
        if(!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }
        let totalAmount = 0;
        const lineItems = orderItems.map((order) => {
            const amount = Math.round(order.price * 100) // stripe wants u to send in the format of cents
            totalAmount += amount * order.quantity
            return {
                price_data: {
                    currency: "USD",
                    order_data: {
                        name: order.name,
                        images: [order.image]
                    },
                    unit_amount: amount,
                },
                quantity: order.quantity || 1
            }
        });
        let coupon = null;
        if(couponCode) {
            coupon = await Coupon.findOne({ user: req.user._id, isActive: true, coupon: couponCode })
            if(coupon) {
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100)
            }
        }
        // session is paymentResult._id in Order model
        const session = await Stripe.checkout.sessions.create(
            {
                payment_method: ["card"],
                line_items: lineItems,
                mode: "payment",
                success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
                discounts: coupon 
                ? [
                    { coupon: await createStripeCoupon(coupon.discountPercentage) }
                  ]
                : [],
                metadata: {
                    user: req.user._id.toString(),
                    couponCode: couponCode || "",
                    orders: JSON.stringify(
                        orderItems.map((or) => ({
                            id: or._id,
                            quantity: or.quantity,
                            price: or.price
                        }))
                        
                    )
                }
            }
        );
        if(totalAmount > 20000) {
            await createNewCoupon(req.user._id)
        }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
}

const checkoutSuccess = async(req, res) => {
    try {
        // session is paymentResult._id in Order model
        const { sessionId } = req.body
        const session = await Stripe.checkout.sessions.retrieve(sessionId)
        if(session.payment_status === "paid") {
            if(session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadata.couponCode,
                        user: session.metadata.user
                    },
                    {
                        isActive: false
                    },
                )
            }
        }
        // Create a new Order
        const products = JSON.parse(session.metadata.products)
        const order = new Order({
            user: session.metadata.user,
            orderItems: products.map((product) => ({
                product: product.id,
                name: product.name,
                quantity: product.quantity,
                image: product.image,
                price: product.price
            })),
            shippingAddress: {
                address: session.shipping_address.address,
                city: session.shipping_address.city,
                postalCode: session.shipping_address.postalCode,
                country: session.shipping_address.country
            },
            paymentMethod: session.payment_method_types[0],
            paymentResult: {
                id: session.id,
                status: session.payment_status,
                update_time: session.updated_at,
                email_address: session.customer_email,
            },
            itemsPrice: session.amount_subtotal / 100,
            taxPrice: session.amount_tax / 100,
            shippingPrice: session.amount_shipping / 100,
            totalPrice: session.amount_total / 100,
            isPaid: true,
            paidAt: new Date(),
        });
        await order.save()
        res.status(200).json({
            success: true,
            message: "Payment successful, order created, and coupon deactivated if used.",
            orderId: order._id,
        });
    } catch (error) {
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
}


async function createStripeCoupon(discountPercentage) {
    const coupon = await Stripe.coupon.create(
        { 
            percent_off: discountPercentage,
            duration: "once", 
        }
    )
    return coupon.id
}
async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({ userId })
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		user: userId,
    })
    await newCoupon.save()
    return newCoupon
}
module.exports = {
    checkoutSuccess,
    createCheckoutSession
}