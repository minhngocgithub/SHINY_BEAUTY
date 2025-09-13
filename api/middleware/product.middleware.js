const mongoose = require('mongoose');

function stripHtmlTags(htmlText) {
  if (!htmlText || typeof htmlText !== 'string') return '';
  
  return htmlText
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .substring(0, 500);
}

function preSaveMiddleware(next) {
  if (this.description) {
    this.description = stripHtmlTags(this.description);
  }
  
  if (this.price && !this.originalPrice) {
    this.originalPrice = this.price;
  }
  
  if (this.salePrice && (this.originalPrice || this.price)) {
    const basePrice = this.originalPrice || this.price;
    this.discountPercentage = Math.round(
      ((basePrice - this.salePrice) / basePrice) * 100
    );
  }
  
  if (this.featured && this.featuredExpiry && new Date() > this.featuredExpiry) {
    this.featured = false;
  }
  
  if (this._validateAndSetSaleStatus) {
    this._validateAndSetSaleStatus();
  }
  
  if (this._handleNewProductStatus) {
    this._handleNewProductStatus();
  }
  
  if (this._validateFlashSaleStock) {
    this._validateFlashSaleStock();
  }
  
  next();
}

function preUpdateMiddleware(next) {
  const update = this.getUpdate();
  
  if (update.description) {
    update.description = stripHtmlTags(update.description);
  }
  
  if (update.salePrice && (update.originalPrice || update.price)) {
    const basePrice = update.originalPrice || update.price;
    update.discountPercentage = Math.round(
      ((basePrice - update.salePrice) / basePrice) * 100
    );
  }
  
  if (update.price && !update.originalPrice) {
    update.originalPrice = update.price;
  }
  
  if (update.featured && update.featuredExpiry && new Date() > update.featuredExpiry) {
    update.featured = false;
  }
  
  next();
}

function preFindMiddleware(next) {
  this.populate({
    path: "category",
    select: "name",
  });
  next();
}

const virtualFields = {
  currentPrice: {
    get: function() {
      if (this.isSaleActive) {
        return this.salePrice || this.price;
      }
      return this.price;
    }
  },
  
  isSaleActive: {
    get: function() {
      if (!this.isOnSale) return false;
      
      const now = new Date();
      const startValid = !this.saleStartDate || this.saleStartDate <= now;
      const endValid = !this.saleEndDate || this.saleEndDate >= now;
      
      return startValid && endValid && this.salePrice && this.salePrice > 0;
    }
  },
  
  savings: {
    get: function() {
      if (this.isSaleActive && this.salePrice) {
        const basePrice = this.originalPrice || this.price;
        return basePrice - this.salePrice;
      }
      return 0;
    }
  },
  
  isFeaturedActive: {
    get: function() {
      if (!this.featured) return false;
      if (!this.featuredExpiry) return true;
      return new Date() <= this.featuredExpiry;
    }
  }
};

const instanceMethods = {
  _validateAndSetSaleStatus: function() {
    const now = new Date();
    
    if (this.isOnSale && this.saleEndDate && this.saleEndDate <= now) {
      this.endSale();
      return;
    }
    
    if (!this.isOnSale && this.saleStartDate && this.saleStartDate <= now && 
        this.saleEndDate && this.saleEndDate > now && this.salePrice) {
      this.isOnSale = true;
    }
  },
  
  _handleNewProductStatus: function() {
    if (this.isNewProduct && this.newUntil && new Date() > this.newUntil) {
      this.isNewProduct = false;
    }
  },
  
  _validateFlashSaleStock: function() {
    if (this.flashSale && this.flashSale.isFlashSale) {
      if (this.flashSale.saleStock > this.countInstock) {
        this.flashSale.saleStock = this.countInstock;
      }
      
      if (this.flashSale.saleStock <= 0) {
        this.flashSale.isFlashSale = false;
      }
    }
  },

  setSale: function(saleData) {
    const { salePrice, discountPercentage, startDate, endDate, saleType = 'percentage' } = saleData;
    
    if (!salePrice && !discountPercentage) {
      throw new Error('Either salePrice or discountPercentage is required');
    }
    
    if (discountPercentage && (discountPercentage < 0 || discountPercentage > 100)) {
      throw new Error('Discount percentage must be between 0 and 100');
    }
    
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      throw new Error('Sale start date must be before end date');
    }
    
    if (!this.originalPrice) {
      this.originalPrice = this.price;
    }
    
    if (discountPercentage && !salePrice) {
      this.salePrice = Math.round(this.price * (1 - discountPercentage / 100) * 100) / 100;
      this.discountPercentage = discountPercentage;
    } else if (salePrice) {
      if (salePrice >= this.originalPrice) {
        throw new Error('Sale price must be less than original price');
      }
      this.salePrice = salePrice;
      this.discountPercentage = Math.round(
        ((this.originalPrice - salePrice) / this.originalPrice) * 100
      );
    }
    
    this.saleStartDate = startDate ? new Date(startDate) : new Date();
    this.saleEndDate = endDate ? new Date(endDate) : null;
    this.saleType = saleType;
    
    const now = new Date();
    this.isOnSale = this.saleStartDate <= now && 
                    (!this.saleEndDate || this.saleEndDate > now);
    
    return this;
  },

  endSale: function() {
    this.isOnSale = false;
    this.salePrice = null;
    this.discountPercentage = 0;
    this.saleEndDate = new Date();
    
    if (this.flashSale && this.flashSale.isFlashSale) {
      this.flashSale.isFlashSale = false;
    }
    
    return this;
  },

  setFlashSale: function(flashSaleData) {
    const { 
      discountPercentage, 
      saleStock, 
      maxQuantityPerUser = 5,
      startDate,
      endDate
    } = flashSaleData;
    
    if (!discountPercentage || saleStock === undefined || saleStock === null) {
      throw new Error('Discount percentage and sale stock are required for flash sale');
    }
    
    if (saleStock > this.countInstock) {
      throw new Error('Sale stock cannot exceed available stock');
    }
    
    if (saleStock < 0) {
      throw new Error('Sale stock cannot be negative');
    }
    
    if (maxQuantityPerUser <= 0) {
      throw new Error('Max quantity per user must be positive');
    }
    
    this.setSale({
      discountPercentage,
      startDate,
      endDate,
      saleType: 'flash_sale'
    });
    
    this.flashSale = {
      isFlashSale: true,
      originalStock: this.countInstock,
      saleStock: Number(saleStock),
      maxQuantityPerUser: Number(maxQuantityPerUser)
    };
    
    return this;
  },

  updateStock: function(quantitySold) {
    if (!Number.isInteger(quantitySold) || quantitySold <= 0) {
      throw new Error('Quantity sold must be a positive integer');
    }
    
    if (quantitySold > this.countInstock) {
      throw new Error('Cannot sell more than available stock');
    }
    
    if (this.flashSale && this.flashSale.isFlashSale) {
      if (quantitySold > this.flashSale.saleStock) {
        throw new Error('Cannot sell more than flash sale stock available');
      }
    }
    
    this.countInstock -= quantitySold;
    this.sold += quantitySold;
    
    if (this.flashSale && this.flashSale.isFlashSale && this.flashSale.saleStock > 0) {
      this.flashSale.saleStock = Math.max(0, this.flashSale.saleStock - quantitySold);
      
      if (this.flashSale.saleStock <= 0) {
        this.flashSale.isFlashSale = false;
      }
    }
    
    return this;
  },
  
  canPurchase: function(quantity, userId = null) {
    if (quantity > this.countInstock) {
      return {
        canPurchase: false,
        reason: 'Insufficient stock',
        availableQuantity: this.countInstock
      };
    }
    
    if (this.flashSale && this.flashSale.isFlashSale) {
      if (quantity > this.flashSale.saleStock) {
        return {
          canPurchase: false,
          reason: 'Insufficient flash sale stock',
          availableQuantity: this.flashSale.saleStock
        };
      }
      
      if (quantity > this.flashSale.maxQuantityPerUser) {
        return {
          canPurchase: false,
          reason: 'Exceeds maximum quantity per user for flash sale',
          maxAllowed: this.flashSale.maxQuantityPerUser
        };
      }
    }
    
    return {
      canPurchase: true,
      availableQuantity: this.countInstock
    };
  },
  
  getPriceDetails: function() {
    const basePrice = this.originalPrice || this.price;
    const currentPrice = this.isSaleActive ? (this.salePrice || this.price) : this.price;
    const savings = this.isSaleActive ? (basePrice - currentPrice) : 0;
    
    return {
      basePrice,
      currentPrice,
      salePrice: this.salePrice,
      savings,
      discountPercentage: this.discountPercentage,
      isSaleActive: this.isSaleActive,
      saleType: this.saleType
    };
  }
};

const indexes = [
  { featured: 1, featuredOrder: 1, featuredAt: -1 },
  { featured: 1, featuredType: 1, featuredOrder: 1 },
  { featuredExpiry: 1 },
  { isOnSale: 1, discountPercentage: -1 },
  { saleEndDate: 1 },
  { price: 1, 'ratings.average': -1 },
  { category: 1 },
  { brand: 1 },
  { trendingScore: -1 },
  { sold: -1 },
  { createdAt: -1 },
  { countInstock: 1, sold: -1 },
  { name: 'text', description: 'text' }
];

function applyMiddleware(schema) {
  schema.pre('save', preSaveMiddleware);
  schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], preUpdateMiddleware);
  schema.pre(/^find/, preFindMiddleware);
  
  Object.keys(virtualFields).forEach(fieldName => {
    schema.virtual(fieldName, virtualFields[fieldName]);
  });
  
  Object.keys(instanceMethods).forEach(methodName => {
    schema.methods[methodName] = instanceMethods[methodName];
  });
  
  indexes.forEach(index => {
    schema.index(index);
  });
  
  schema.set('toJSON', { virtuals: true });
  schema.set('toObject', { virtuals: true });
}

module.exports = {
  applyMiddleware,
  stripHtmlTags,
  preSaveMiddleware,
  preUpdateMiddleware,
  preFindMiddleware,
  virtualFields,
  instanceMethods,
  indexes
};