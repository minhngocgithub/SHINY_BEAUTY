const SaleProgram = require('../models/saleProgram.models')
const Product = require('../models/product.models')
const ProductBundle = require('../models/productBundle.models')

class SaleProgramService {
    static async getActiveSalePrograms({ user = null, cart = null, now = new Date() } = {}) {
        try {
            const salePrograms = await SaleProgram.find({
                isActive: true,
                status: 'active',
                startDate: { $lte: now },
                $or: [
                    { endDate: null },
                    { endDate: { $gte: now } }
                ],
                $and: [
                    {
                        $or: [
                            { maxUsage: null },
                            { maxUsage: { $exists: false } },
                            { $expr: { $lt: ['$currentUsage', '$maxUsage'] } }
                        ]
                    }
                ]
            }).populate([
                { path: 'conditions.applicableProducts', select: 'name price' },
                { path: 'conditions.categories', select: 'name' },
                { path: 'conditions.applicableBundles', select: 'name bundlePrice' }
            ]);

            return salePrograms.filter(sp => this.validateProgramConditions(sp, user, cart));
        } catch (error) {
            console.error('Error getting active sale programs:', error);
            return [];
        }
    }
    static validateProgramConditions(program, user, cart) {
        const conditions = program.conditions;
        if (conditions.membershipRequired && !user?.loyaltyProfile) {
            return false;
        }

        if (conditions.membershipTiers?.length > 0) {
            if (!user?.loyaltyProfile || !conditions.membershipTiers.includes(user.loyaltyProfile.tier)) {
                return false;
            }
        }

        // New customers only
        if (conditions.newCustomersOnly && user?.loyaltyProfile?.totalOrders > 0) {
            return false;
        }

        // First order only
        if (conditions.firstOrderOnly && user?.loyaltyProfile?.totalOrders > 0) {
            return false;
        }

        // Cart-based conditions
        if (cart) {
            if (conditions.minOrderValue && cart.subtotal < conditions.minOrderValue) {
                return false;
            }

            if (conditions.maxOrderValue && cart.subtotal > conditions.maxOrderValue) {
                return false;
            }

            // Promo code validation
            if (conditions.requiredPromoCode &&
                cart.promoCode?.toLowerCase() !== conditions.requiredPromoCode.toLowerCase()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get applicable sale programs for a product
     */
    static async getSaleProgramsForProduct(product, user = null) {
        const salePrograms = await this.getActiveSalePrograms({ user });

        return salePrograms.filter(program => {
            return this.isProductEligible(program, product);
        });
    }

    /**
     * Check if product is eligible for a program
     */
    static isProductEligible(program, product) {
        const conditions = program.conditions;

        // If no specific conditions, applies to all
        if (!conditions.applicableProducts?.length &&
            !conditions.categories?.length &&
            !conditions.brands?.length) {
            return true;
        }

        // Check exclude list first
        if (conditions.excludeProducts?.some(id => id.equals(product._id))) {
            return false;
        }

        // Check specific products
        if (conditions.applicableProducts?.some(id => id.equals(product._id))) {
            return true;
        }

        // Check categories
        if (conditions.categories?.length > 0) {
            const productCategories = Array.isArray(product.category) ? product.category : [product.category];
            if (productCategories.some(cat => conditions.categories.some(condCat => condCat.equals(cat)))) {
                return true;
            }
        }

        // Check brands
        if (conditions.brands?.includes(product.brand)) {
            return true;
        }

        return false;
    }
    static calculateProductDiscount(product, salePrograms) {
        let bestDiscount = {
            amount: 0,
            finalPrice: product.price,
            program: null,
            type: 'none'
        };

        // Consider existing product-level sale first
        if (product.isSaleActive && product.salePrice) {
            bestDiscount = {
                amount: product.savings,
                finalPrice: product.salePrice,
                program: null,
                type: 'product_sale'
            };
        }

        // Check each sale program
        for (const program of salePrograms) {
            const discount = this.calculateProgramDiscount(program, product);

            if (discount.amount > bestDiscount.amount) {
                bestDiscount = {
                    ...discount,
                    program: program,
                    type: 'sale_program'
                };
            }
        }

        return bestDiscount;
    }

    /**
     * Calculate discount from a specific program
     */
    static async calculateProgramDiscount(program, product) {
        const benefits = program.benefits;
        let discount = 0;

        switch (program.type) {
            case 'percentage_sale':
                if (benefits.discountPercentage) {
                    discount = (product.price * benefits.discountPercentage) / 100;
                }
                break;

            case 'fixed_amount_sale':
                if (benefits.discountAmount) {
                    discount = Math.min(benefits.discountAmount, product.price);
                }
                break;

            case 'flash_sale':
                // Handle flash sale logic
                if (benefits.discountPercentage) {
                    discount = (product.price * benefits.discountPercentage) / 100;
                }
                break;

            default:
                discount = 0;
        }

        return {
            amount: discount,
            finalPrice: Math.max(0, product.price - discount)
        };
    }

    /**
     * Apply sale programs to cart
     */
    static async applyProgramsToCart(cartItems, user) {
        const salePrograms = await this.getActiveSalePrograms({ user });
        const results = [];

        for (const cartItem of cartItems) {
            let itemResult = {
                ...cartItem.toObject ? cartItem.toObject() : cartItem,
                originalPrice: 0,
                finalPrice: 0,
                discount: 0,
                appliedProgram: null
            };

            if (cartItem.itemType === 'product' && cartItem.product) {
                const product = cartItem.product;
                const applicablePrograms = salePrograms.filter(program =>
                    this.isProductEligible(program, product)
                );

                const discountInfo = this.calculateProductDiscount(product, applicablePrograms);

                itemResult.originalPrice = product.price * cartItem.quantity;
                itemResult.finalPrice = discountInfo.finalPrice * cartItem.quantity;
                itemResult.discount = discountInfo.amount * cartItem.quantity;
                itemResult.appliedProgram = discountInfo.program;

            } else if (cartItem.itemType === 'bundle' && cartItem.bundle) {
                const bundle = cartItem.bundle;
                // For bundles, use bundle pricing (could be enhanced to apply programs to bundles)
                itemResult.originalPrice = bundle.originalPrice ? bundle.originalPrice * cartItem.quantity : bundle.bundlePrice * cartItem.quantity;
                itemResult.finalPrice = bundle.bundlePrice * cartItem.quantity;
                itemResult.discount = bundle.savings ? bundle.savings * cartItem.quantity : 0;
            }

            results.push(itemResult);
        }

        return results;
    }

    /**
     * Get cart-level programs (free shipping, gift with purchase, etc.)
     */
    static async getCartLevelPrograms(cart, user) {
        const salePrograms = await this.getActiveSalePrograms({ user, cart });

        return salePrograms.filter(program => {
            return ['free_shipping', 'gift_with_purchase', 'spend_x_get_y', 'points_multiplier']
                .includes(program.type);
        });
    }

    /**
     * Apply cart-level benefits
     */
    static applyCartLevelBenefits(cart, programs) {
        let cartBenefits = {
            freeShipping: false,
            bonusPoints: 0,
            gifts: [],
            additionalDiscount: 0
        };

        for (const program of programs) {
            switch (program.type) {
                case 'free_shipping':
                    cartBenefits.freeShipping = true;
                    break;

                case 'points_multiplier':
                    if (program.benefits.pointsMultiplier > 1) {
                        cartBenefits.bonusPoints += Math.floor(
                            cart.subtotal * (program.benefits.pointsMultiplier - 1)
                        );
                    }
                    break;

                case 'gift_with_purchase':
                    if (program.benefits.giftProducts?.length > 0) {
                        cartBenefits.gifts.push(...program.benefits.giftProducts);
                    }
                    break;

                case 'spend_x_get_y':
                    if (cart.subtotal >= program.conditions.minOrderValue) {
                        cartBenefits.additionalDiscount += program.benefits.discountAmount || 0;
                    }
                    break;
            }
        }

        return cartBenefits;
    }

    /**
     * Filter programs by stacking rules
     */
    static filterByStackingRules(programs) {
        if (!programs || programs.length === 0) return [];

        // Sort by priority (cao → thấp)
        const sorted = programs.sort((a, b) =>
            (b.displaySettings?.priority || 0) - (a.displaySettings?.priority || 0)
        );

        const result = [];

        for (const program of sorted) {
            const hasConflict = result.some(existing => {
                // Chỉ conflict khi CẢ HAI đều không cho phép stacking
                if (!program.stacking && !existing.stacking) {
                    return true;
                }

                // Check explicit exclusions
                if (existing.exclusiveWith?.some(id => id.equals(program._id))) {
                    return true;
                }

                if (program.exclusiveWith?.some(id => id.equals(existing._id))) {
                    return true;
                }

                return false;
            });

            if (!hasConflict) {
                result.push(program);
            }
        }

        return result;
    }

    /**
     * Track program usage
     */
    static async trackProgramUsage(programId, orderId, userId, discountAmount) {
        try {
            await SaleProgram.findByIdAndUpdate(programId, {
                $inc: {
                    currentUsage: 1,
                    'stats.applications': 1,
                    'stats.totalDiscount': discountAmount
                }
            });

            console.log(`Tracked usage for sale program: ${programId}`);
        } catch (error) {
            console.error('Error tracking program usage:', error);
        }
    }

    /**
     * Get program analytics
     */
    static async getProgramAnalytics(programId) {
        try {
            const program = await SaleProgram.findById(programId);
            if (!program) return null;

            const analytics = {
                programId,
                title: program.title,
                type: program.type,
                stats: program.stats,
                isActive: program.isCurrentlyActive,
                timeRemaining: program.timeRemaining,
                usageRate: program.maxUsage ?
                    ((program.currentUsage / program.maxUsage) * 100).toFixed(2) : null,
                conversionRate: program.stats.views > 0 ?
                    ((program.stats.applications / program.stats.views) * 100).toFixed(2) : 0,
                averageDiscount: program.stats.applications > 0 ?
                    (program.stats.totalDiscount / program.stats.applications).toFixed(2) : 0
            };

            return analytics;
        } catch (error) {
            console.error('Error getting program analytics:', error);
            return null;
        }
    }
}

module.exports = SaleProgramService;