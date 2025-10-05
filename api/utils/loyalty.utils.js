const User = require('../models/user.models');
const Order = require('../models/order.models');

class LoyaltyService {
    static getTierBenefits(tier) {
        const TIER_BENEFITS = {
            NEW_CUSTOMER: {
                name: 'New Customer',
                discountRate: 0,
                freeShippingThreshold: 100,
                pointsMultiplier: 1,
                earlyAccess: false,
                birthdayGift: false
            },
            REGULAR: {
                name: 'Regular Customer',
                discountRate: 0.05,
                freeShippingThreshold: 75,
                pointsMultiplier: 1.2,
                earlyAccess: false,
                birthdayGift: true
            },
            VIP: {
                name: 'VIP Customer',
                discountRate: 0.10,
                freeShippingThreshold: 50,
                pointsMultiplier: 1.5,
                earlyAccess: true,
                birthdayGift: true,
                exclusiveProducts: true
            },
            PLATINUM: {
                name: 'Platinum Elite',
                discountRate: 0.15,
                freeShippingThreshold: 0,
                pointsMultiplier: 2,
                earlyAccess: true,
                birthdayGift: true,
                exclusiveProducts: true,
                conciergeService: true
            }
        };
        
        return TIER_BENEFITS[tier] || TIER_BENEFITS.NEW_CUSTOMER;
    }

    static calculateDiscount(user, orderAmount) {
        if (!user || !user.loyaltyProfile) {
            return 0;
        }
        
        const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
        return Math.round((orderAmount * benefits.discountRate) * 100) / 100;
    }
  
    static isEligibleForFreeShipping(user, orderAmount) {
        if (!user || !user.loyaltyProfile) {
            return orderAmount >= 100; // Default threshold
        }
        
        const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
        return orderAmount >= benefits.freeShippingThreshold;
    }
    
    static calculatePointsToEarn(user, orderAmount) {
        if (!user || !user.loyaltyProfile) {
            return Math.floor(orderAmount); // Default 1:1 ratio
        }
        
        const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
        return Math.floor(orderAmount * benefits.pointsMultiplier);
    }
    static getRecommendationStrategy(user) {
        if (!user || !user.loyaltyProfile) {
            return { bestSeller: 0.65, newProduct: 0.35 };
        }
        
        const tier = user.loyaltyProfile.tier;
        const isNewCustomer = user.loyaltyProfile.totalOrders === 0;

        if (isNewCustomer) {
            return { bestSeller: 0.8, newProduct: 0.2 };
        }

        const hour = new Date().getHours();
        const isEveningOrWeekend = hour >= 18 || [0, 6].includes(new Date().getDay());
        
        let strategy;
        switch(tier) {
            case 'NEW_CUSTOMER':
                strategy = { bestSeller: 0.75, newProduct: 0.25 };
                break;
                
            case 'REGULAR':
                strategy = { bestSeller: 0.6, newProduct: 0.4 };
                break;
                
            case 'VIP':
                strategy = { bestSeller: 0.3, newProduct: 0.7 };
                break;
                
            case 'PLATINUM':
                strategy = { bestSeller: 0.2, newProduct: 0.8 };
                break;
                
            default:
                strategy = { bestSeller: 0.65, newProduct: 0.35 };
        }
        
        if (isEveningOrWeekend && tier !== 'NEW_CUSTOMER') {
            const adjustment = 0.1;
            strategy.newProduct = Math.min(0.9, strategy.newProduct + adjustment);
            strategy.bestSeller = 1 - strategy.newProduct;
        }
        
        return strategy;
    }
    static async getLoyaltyDashboard(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                console.log('User not found');
            }
            
            const benefits = this.getTierBenefits(user.loyaltyProfile.tier);
            const nextTierInfo = this.getNextTierInfo(user);
            
            return {
                currentTier: {
                    name: benefits.name,
                    tier: user.loyaltyProfile.tier,
                    benefits: benefits
                },
                points: user.loyaltyProfile.points,
                totalSpent: user.loyaltyProfile.totalSpent,
                totalOrders: user.loyaltyProfile.totalOrders,
                averageOrderValue: user.loyaltyProfile.averageOrderValue,
                nextTier: nextTierInfo,
                memberSince: user.createdAt,
                lastPurchase: user.loyaltyProfile.lastPurchaseDate
            };
        } catch (error) {
            console.log(`Error getting loyalty dashboard: ${error.message}`);
        }
    }
    static getNextTierInfo(user) {
        const currentTier = user.loyaltyProfile.tier;
        const totalSpent = user.loyaltyProfile.totalSpent;
        const totalOrders = user.loyaltyProfile.totalOrders;
        
        let nextTier, requiredSpending, requiredOrders;
        
        switch(currentTier) {
            case 'NEW_CUSTOMER':
                nextTier = 'REGULAR';
                requiredSpending = Math.max(0, 0 - totalSpent); // No spending requirement
                requiredOrders = Math.max(0, 3 - totalOrders);
                break;
                
            case 'REGULAR':
                nextTier = 'VIP';
                requiredSpending = Math.max(0, 1000 - totalSpent);
                requiredOrders = Math.max(0, 20 - totalOrders);
                break;
                
            case 'VIP':
                nextTier = 'PLATINUM';
                requiredSpending = Math.max(0, 2000 - totalSpent);
                requiredOrders = Math.max(0, 50 - totalOrders);
                break;
                
            case 'PLATINUM':
                return null;
                
            default:
                return null;
        }
        
        return {
            tier: nextTier,
            name: this.getTierBenefits(nextTier).name,
            requiredSpending,
            requiredOrders,
            progressSpending: requiredSpending === 0 ? 100 : ((totalSpent / (totalSpent + requiredSpending)) * 100),
            progressOrders: requiredOrders === 0 ? 100 : ((totalOrders / (totalOrders + requiredOrders)) * 100)
        };
    }
}

module.exports = LoyaltyService;