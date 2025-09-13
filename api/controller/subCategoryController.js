const subCategory = require('../models/subCategory.models')

const addSubCategory = async(req, res) => {
    try {
        const { name, category } = req.body
        if(!name && !category[0]) {
            return res.status(400).json({
                message : "Provide name, category",
                error : true,
                success : false
            })
        }
        const payload = {
            name, category
        }
        const newSubCategory = await subCategory.create(payload)
        if(!newSubCategory) {
            return res.status(400).json({
                message : "Create new subCategory unsuccessfully.",
                error : true,
                success : false
            })
        }
        return res.status(200).json({
            message : "Sub Category Created",
            data : newSubCategory,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }

}
const getSubCategory = async(req, res) => {
    try {
        const data = await subCategory.find().populate('Category')
        if(!data) {
            return res.status(400).json({
                message : "Not found any subCategory",
                error : true,
                success : false
            })
        } 
        return res.status(200).json({
            message : "SubCategory data",
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

const updateSubCategory = async(req, res) => {
    try {
        const { id, name, category } = req.body
        const checkSub = await subCategory.findById(id)
        if(!checkSub) {
            return res.status(400).json({
                message : "Check your _id",
                error : true,
                success : false
            })
        }
        const updateSubCategory = await subCategory.findByIdAndUpdate(id, {
            name, category
        })
        if(!updateSubCategory) {
            return res.status(500).json({
                message : "Update unsuccessfully.",
                error : true,
                success : false
            })
        }
        return res.status(200).json({
            message : 'Updated Successfully',
            data : updateSubCategory,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
const deleteSubCategory = async(req, res) => {
    try {
        const { id } = req.body
        const deleteSub = await subCategory.findByIdAndDelete(id)
        if(!deleteSub) {
            return res.status(500).json({
                message : "Delete unSuccessfully.",
                error : true,
                success : false
            })
        }
        return res.status(200).json({
            message : "Delete successfully",
            data : deleteSub,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
module.exports = {
    addSubCategory,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory

}