const Coupon = require('../models/coupon.models')

const getCoupon = async(req, res) => {
    try {
        const coupon = await Coupon.findOne({ user: req.user._id, isActive: true })
        res.json(coupon || "Not found")
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

}

const getAllCoupon = async(req, res) => {
    try {
        const coupons = await Coupon.find()
        res.json(coupons)
    } catch (error) {
        res.json({message: "Have an error", error})
    }
}

const validateCoupon = async(req, res) => {
    try {
        const {code} = req.body
        const coupon = await Coupon.findOne({ code: code, user: req.user._id, isActive: true })
        if(!coupon) {
            return res.status(404).json({ message: "Coupon not found" })
        }
        if(coupon.expire < new Date()) {
            coupon.isActive = false
            await coupon.save()
            return res.status(404).json({ message: "Coupon expired" });
        }
        res.json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        })

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const createCoupon = async(req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body)
        res.json(newCoupon)
    } catch (error) {
        res.json({ message: "Cannot create coupon", error })
    }
}
const deleteCoupon = async(req, res) => {
    const { id } = req.params
    try {
        const deleteCoupon = await Coupon.findByIdAndDelete(id)
        res.json({ message: "Delete successfully", deleteCoupon })

    } catch (error) {
        res.json({ message: "Cannot delete coupon", error })
    }
}
module.exports = {
    getCoupon,
    validateCoupon,
    createCoupon,
    getAllCoupon,
    deleteCoupon

}