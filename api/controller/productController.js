const Product = require('../models/product.models')
const { uploadImageCloudinary, deleteImageFromCloudinary } = require('../utils/upload.service')
const slugify = require('slugify')
const cloudinary = require('../config/cloudinary')
const Review = require('../models/review.models')
const SaleProgramUtils = require('../utils/saleProgram.utils');

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
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      })
    }

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .lean()

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    return res.status(200).json({
      success: true,
      productData: product
    })
  } catch (error) {
    console.error('Get Product Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error.message
    })
  }
}

const getNewProduct = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const products = await Product.find({ isNewProduct: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort('-createdAt')
      .lean()

    return res.status(200).json({
      success: true,
      total: products.length,
      products
    })
  } catch (error) {
    console.error('Get New Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving new products',
      error: error.message
    })
  }
}
const getBestSeller = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const products = await Product.find({ isBestSeller: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort('-sold')
      .lean()

    return res.status(200).json({
      success: true,
      total: products.length,
      products
    })
  } catch (error) {
    console.error('Get Best Sellers Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving best sellers',
      error: error.message
    })
  }
}
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      search,
      sort = '-createdAt',
      inStock
    } = req.query

    const filter = {}

    if (category) filter.category = category
    if (brand) filter.brand = new RegExp(brand, 'i')
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }
    if (minRating) filter['ratings.average'] = { $gte: Number(minRating) }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ]
    }
    if (inStock === 'true') filter.countInstock = { $gt: 0 }

    const pageNum = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip = (pageNum - 1) * limitNum

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter)
    ])

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Get All Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error.message
    })
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
  try {
    const { name, category, brand, minPrice, maxPrice } = req.query
    const productCriteria = {}

    if (name) productCriteria.name = { $regex: name, $options: 'i' }
    if (category) productCriteria.category = category
    if (brand) productCriteria.brand = { $regex: brand, $options: 'i' }
    if (minPrice || maxPrice) {
      productCriteria.price = {}
      if (minPrice) productCriteria.price.$gte = Number(minPrice)
      if (maxPrice) productCriteria.price.$lte = Number(maxPrice)
    }

    const products = await Product.find(productCriteria)
      .populate('category', 'name slug')
      .lean()

    return res.status(200).json({
      success: true,
      total: products.length,
      query: { name, category, brand, minPrice, maxPrice },
      products
    })
  } catch (error) {
    console.error('Search Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    })
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
const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params
    const limit = parseInt(req.query.limit) || 8
    const currentProduct = await Product.findById(id).lean()

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: { $in: currentProduct.category }, brand: currentProduct.brand },
        { category: { $in: currentProduct.category } },
        { brand: currentProduct.brand }
      ],
      countInstock: { $gt: 0 }
    })
      .populate('category', 'name slug')
      .limit(limit)
      .sort({ sold: -1, 'ratings.average': -1, createdAt: -1 })
      .select('name brand category description price image countInstock sold ratings featured')
      .lean()

    if (relatedProducts.length < limit) {
      const additionalProducts = await Product.find({
        _id: { $ne: id, $nin: relatedProducts.map(p => p._id) },
        countInstock: { $gt: 0 }
      })
        .populate('category', 'name slug')
        .limit(limit - relatedProducts.length)
        .sort({ sold: -1, 'ratings.average': -1 })
        .select('name brand category description price image countInstock sold ratings featured')
        .lean()

      relatedProducts.push(...additionalProducts)
    }

    return res.status(200).json({
      success: true,
      total: relatedProducts.length,
      currentProduct: {
        id: currentProduct._id,
        name: currentProduct.name,
        category: currentProduct.category,
        brand: currentProduct.brand
      },
      products: relatedProducts
    })
  } catch (error) {
    console.error('Get Related Products Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Error getting related products',
      error: error.message
    })
  }
}
const getProductWithReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get review statistics
    const reviewStats = await Review.getProductStats(id);

    // Get featured reviews
    const featuredReviews = await Review.getFeaturedReviews(id, 3);

    // Count questions and feedbacks
    const questionCount = await Review.countDocuments({
      product: id,
      reviewType: 'question',
      status: 'published'
    });

    const feedbackCount = await Review.countDocuments({
      product: id,
      reviewType: 'feedback',
      status: 'published'
    });

    return res.status(200).json({
      success: true,
      productData: {
        ...product,
        reviewSummary: {
          ...reviewStats,
          questionCount,
          feedbackCount,
          featuredReviews
        }
      }
    });
  } catch (error) {
    console.error('Get Product With Reviews Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting product',
      error: error.message
    });
  }
};

const getProductsWithReviewData = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort = '-createdAt'
    } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) {
      filter['ratings.average'] = { $gte: Number(minRating) };
    }

    // Get products
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    // Add review count for each product
    const productsWithReviews = await Promise.all(
      products.map(async (product) => {
        const reviewCount = await Review.countDocuments({
          product: product._id,
          reviewType: 'rating',
          status: 'published'
        });

        return {
          ...product,
          reviewCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      products: productsWithReviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get Products With Review Data Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  getNewProduct,
  getBestSeller,
  updateProduct,
  deleteProduct,
  searchProduct,
  uploadProductImage,
  getRelatedProducts,
  getProductWithReviews,
  getProductsWithReviewData
}