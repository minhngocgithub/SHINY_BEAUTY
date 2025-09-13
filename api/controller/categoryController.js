const Category = require("../models/category.models");
const Product = require("../models/product.models");

const addNewCategory = async(req, res) => {
    try {
        const { name } = req.body
        if(!name){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }
        const payload = {
            name
        }
        const category = await Category.create(payload)
        if(!category){
            return res.status(500).json({
                message : "Not Created",
                error : true,
                success : false
            })
        }

        return res.status(200).json({
            message : "Added Category",
            data : category,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    } 
}

const getListCategory = async(req, res) => {
    try {
        const data = await Category.find()
        if(!data) {
            return res.status(404).json({
                message : "Not found any Category",
                success : false,
                error : true
            })
        }
        return res.status(200).json({
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        
    }
}
const updateCategoryName = async(req, res) => {
    try {
        const { id, name } = req.body
        const updateCategoryName = await Category.updateOne({
            _id: id
        }, {
            name
        })
        if(!updateCategoryName) {
            return res.status(500).json({
                message : "Update Category unsuccessfully",
                success : false,
                error : true,
                data : updateCategoryName
            })
        }
        return res.status(200).json({
            message : "Updated Category successfully",
            success : true,
            error : false,
            data : updateCategoryName
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success: false
        })
    }
}
const deleteCategory = async(req, res) => {
    try {
        const { id } = req.body
        const checkSubCategory = await Product.find({
            category: {
                "$in": [ id ]
            }
        }).countDocuments()
        const checkProduct = await Product.find({
            category: {
                "$in": [ id ]
            }
        }).countDocuments()
        if(checkSubCategory > 0 || checkProduct > 0) {
            return res.status(400).json({
                message : "Category is already use can't delete",
                error : true,
                success : false
            })
        }
        const deleteCategory = await Category.deleteOne({ _id: id })
        return res.status(200).json({
            message : "Delete category successfully",
            data : deleteCategory,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            success : false,
            error : true
        })
    }
}
module.exports = {
    addNewCategory,
    getListCategory,
    updateCategoryName,
    deleteCategory

}