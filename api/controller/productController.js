const Product = require('../models/product.models')
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service')
const slugify = require('slugify')
const cloudinary = require('../config/cloudinary')

const createProduct = async(req, res) => {
  try {
      // Destructuring dữ liệu từ request
      const { 
          name, 
          brand, 
          category, 
          description, 
          price, 
          countInstock 
      } = req.body;

      // Validation chi tiết
      const validationErrors = [];
      
      if (!name) validationErrors.push("Name is required");
      if (!brand) validationErrors.push("Brand is required");
      if (!description) validationErrors.push("Description is required");
      if (!price) validationErrors.push("Price is required");
      if (!category) validationErrors.push("Category is required");
      if (!countInstock) validationErrors.push("CountInstock is required");

      // Nếu có lỗi validation, trả về ngay
      if (validationErrors.length > 0) {
          return res.status(400).json({ 
              errors: validationErrors 
          });
      }

      // Xử lý upload ảnh
      let cloudinaryRes = null;
      
      // Kiểm tra xem có file upload hay base64 image
      if (req.file) {
          // Nếu là file upload từ form
          cloudinaryRes = await uploadImageCloudinary(req.file);
      } else if (req.body.image) {
          // Nếu là base64 image
          cloudinaryRes = await cloudinary.uploader.upload(req.body.image, { 
              folder: "products",
              transformation: [
                  { width: 800, height: 600, crop: "limit" }
              ]
          });
      } else {
          return res.status(400).json({ 
              error: "Image is required" 
          });
      }

      // Tạo slug từ tên sản phẩm
      const slug = slugify(name, { 
          lower: true,     // Chuyển thành chữ thường
          strict: true,    // Loại bỏ các ký tự đặc biệt
          trim: true       // Loại bỏ khoảng trắng
      });

      // Tạo đối tượng sản phẩm
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

      // Lưu sản phẩm mới
      const product = new Product(productData);
      await product.save();
    
      // Trả về response
      res.status(201).json({
          success: true,
          message: 'Product created successfully',
          product: product
      });

  } catch (error) {
      console.error('Create Product Error:', error);
      res.status(500).json({
          success: false,
          message: 'Error creating product',
          error: error.message
      });
  }
}


const getProduct = async(req, res) => {
  const { id } = req.params
  
  const product = await Product.findById(id)
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : 'Cannot get product'
  })
  
}

const getNewProduct = async(req, res) => {
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
const getBestSeller = async(req, res) => {
  try {
    const limit = req.query.limit * 1 || 10
    const products = await Product.find({ bestSeller: true }).limit(limit).sort('-sold')
    if(products) {
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

const getAllProducts = async(req, res) => {
  try {
    const products = await Product.find({})
    return res.status(200).json({products})
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
      featured
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

const deleteProduct = async(req, res) => {
  const { id } = req.params
  const product = await Product.findById(id)
  if(!product) {
    return res.status(404).json({ message: "Not founded product!" })
  }
  if(product.image && typeof product.image === 'string') {
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
const searchProduct = async(req, res) => {
  const { name, category, brand } = req.query
  try {
    const productCriteria = {}
    if(name) {
      productCriteria.name = { $regex: name, $option: 'i' }
    }
    if(category) {
      productCriteria.category = { $regex: category, $option: 'i' }
    }
    if(brand) {
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



module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getNewProduct,
  getBestSeller,
  updateProduct,
  deleteProduct,
  searchProduct
}