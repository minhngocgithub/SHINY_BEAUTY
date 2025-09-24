const Product = require('../models/product.models')
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service')
const slugify = require('slugify')
const cloudinary = require('../config/cloudinary')

const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      price,
      countInstock
    } = req.body;
    const validationErrors = [];

    if (!name) validationErrors.push("Name is required");
    if (!brand) validationErrors.push("Brand is required");
    if (!description) validationErrors.push("Description is required");
    if (!price) validationErrors.push("Price is required");
    if (!category) validationErrors.push("Category is required");
    if (!countInstock) validationErrors.push("CountInstock is required");
    if (validationErrors.length > 0) {
      return res.status(400).json({
        errors: validationErrors
      });
    }
    let cloudinaryRes = null;

    if (req.file) {
      cloudinaryRes = await uploadImageCloudinary(req.file);
    }
    // Handle image array case
    else if (req.body.image && Array.isArray(req.body.image) && req.body.image.length > 0) {
      const imageData = req.body.image[0]; // Get first image from array
      if (imageData.url && imageData.public_id) {
        cloudinaryRes = {
          public_id: imageData.public_id,
          secure_url: imageData.url
        };
      }
    }
    // Handle image object case
    else if (req.body.image && typeof req.body.image === 'object' && !Array.isArray(req.body.image)) {
      if (req.body.image.url && req.body.image.public_id) {
        cloudinaryRes = {
          public_id: req.body.image.public_id,
          secure_url: req.body.image.url
        };
      }
    }

    else if (req.body.image && typeof req.body.image === 'string' && (req.body.image.startsWith("http://") || req.body.image.startsWith("https://"))) {
      cloudinaryRes = { secure_url: req.body.image, public_id: null };
    }
    else if (req.body.image && typeof req.body.image === 'string') {
      cloudinaryRes = await cloudinary.uploader.upload(req.body.image, {
        folder: "products",
        transformation: [{ width: 800, height: 600, crop: "limit" }]
      });
    } else {
      return res.status(400).json({
        error: "Image is required"
      });
    }

    const slug = slugify(name, {
      lower: true,
      strict: true,
      trim: true
    });

    const productData = {
      name,
      brand,
      category,
      description,
      price,
      countInstock,
      slug,
      image: {
        public_id: cloudinaryRes.public_id,
        url: cloudinaryRes.secure_url
      }
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product
    });

  } catch (error) {
    console.error('Create Product Error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    })
  }
}
const getProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findById(id)
    return res.status(200).json({
      success: product ? true : false,
      productData: product ? product : 'Cannot get product'
    })
  } catch (error) {
    return res.status(404).json({ message: 'Not found any product', error })
  }

}
const getNewProduct = async (req, res) => {
  try {
    const limit = req.query.limit * 1 || 10
    const products = await Product.find({ isNewProduct: true }).limit(limit).sort("-createAt")

    return res.status(200).json({
      status: "success",
      totals: products.length,
      data: products
    })
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      error: error.message
    })
  }
}
const getBestSeller = async (req, res) => {
  try {
    const limit = req.query.limit * 1 || 10
    const products = await Product.find({ isBestSeller: true }).limit(limit).sort('-sold')
    if (products) {
      return res.status(200).json({
        status: "success",
        totals: products.length,
        data: {
          products
        }
      })
    }
  } catch (error) {
    return res.status(404).json({
      status: "failed",
      error: error.message
    })
  }
}
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
    return res.status(200).json({ products })
  } catch (error) {
    return res.status(404).json({ message: 'Not found any product!', error })
  }

}
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      brand,
      category,
      description,
      price,
      countInstock,
      image,
      featured,
      isBestSeller,
      // totalRating,
      // sold
    } = req.body

    const existingProduct = await Product.findById(id)

    if (!existingProduct) {
      return res.status(404).json({
        error: "Product not found",
      })
    }

    let cloudinaryRes = null

    if (req.file) {
      if (existingProduct.image && existingProduct.image.public_id) {
        await deleteImageFromCloudinary(existingProduct.image.public_id)
      }
      cloudinaryRes = await uploadImageCloudinary(req.file)
    } else if (image) {
      if (Array.isArray(image) && image.length > 0) {
        const imageData = image[0]
        if (imageData.url && imageData.public_id) {
          cloudinaryRes = {
            public_id: imageData.public_id,
            secure_url: imageData.url,
          }
        }
      }
      else if (typeof image === "object" && image.url && image.public_id) {
        cloudinaryRes = {
          public_id: image.public_id,
          secure_url: image.url,
        }
      }
      else if (typeof image === "string" && image.startsWith("data:image")) {
        if (existingProduct.image && existingProduct.image.public_id) {
          await deleteImageFromCloudinary(existingProduct.image.public_id)
        }

        // Upload ảnh base64 mới
        cloudinaryRes = await cloudinary.uploader.upload(image, {
          folder: "products",
          transformation: [{ width: 800, height: 600, crop: "limit" }],
        })
      }
    }
    const updateData = {
      name: name || existingProduct.name,
      brand: brand || existingProduct.brand,
      category: category || existingProduct.category,
      description: description || existingProduct.description,
      price: price || existingProduct.price,
      countInstock: countInstock || existingProduct.countInstock,
      featured: featured !== undefined ? featured : existingProduct.featured,
      isBestSeller: isBestSeller !== undefined ? isBestSeller : existingProduct.isBestSeller,
    }
    // if (totalRating !== undefined) {
    //   updateData.totalRating = totalRating
    // }
    // if (sold !== undefined) {
    //   updateData.sold = sold
    // }

    if (cloudinaryRes) {
      updateData.image = {
        public_id: cloudinaryRes.public_id,
        url: cloudinaryRes.secure_url,
      }
    }
    if (name) {
      updateData.slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
      })
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    })
  } catch (error) {
    console.error("Update Product Error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    })
  }
}
const deleteProduct = async (req, res) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if (!product) {
    return res.status(404).json({ message: "Not founded product!" })
  }
  if (product.image && typeof product.image === 'string') {
    const publicId = product.image.split("/").pop().split(".")[0];
    try {
      await cloudinary.uploader.destroy(`products/${publicId}`);
      console.log("deleted image from cloudinary");
    } catch (error) {
      console.log('Cannot delete image', error);
    }
  }
  await Product.findByIdAndDelete(req.params.id)
  return res.status(200).json({
    success: deleteProduct ? true : false,
    deleteProduct: deleteProduct ? deleteProduct : 'Delete product unsuccessfully.'
  })
}
const searchProduct = async (req, res) => {
  const { name, category, brand } = req.query
  try {
    const productCriteria = {}
    if (name) {
      productCriteria.name = { $regex: name, $option: 'i' }
    }
    if (category) {
      productCriteria.category = { $regex: category, $option: 'i' }
    }
    if (brand) {
      productCriteria.brand = { $regex: brand, $option: 'i' }
    }
    const products = await Product.find(productCriteria)
    return res.status(200).json({
      success: products ? true : false,
      name, category, brand,
      products
    })
  } catch (error) {
    return res.status(404).json({ message: 'Not found any product', error })
  }

}
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an image" });
    }
    const uploadResult = await uploadImageCloudinary(req.file, "products");

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      image: uploadResult,
    });
  } catch (error) {
    console.error("Upload product image error:", error);
    return res.status(500).json({ success: false, message: "Upload failed" });
  }
}
module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getNewProduct,
  getBestSeller,
  updateProduct,
  deleteProduct,
  searchProduct,
  uploadProductImage
}