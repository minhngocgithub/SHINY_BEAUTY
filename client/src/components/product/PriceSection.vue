<template>
  <div class="p-6 border shadow-sm price-section bg-gradient-to-br from-white to-rose-50 rounded-2xl border-rose-100">
    <!-- Regular Price (No Sale) -->
    <div v-if="!activeSale" class="space-y-2">
      <div class="text-4xl font-bold text-gray-900">
        ${{ product.price?.toFixed(2) }}
      </div>
    </div>

    <!-- Sale Price -->
    <div v-else class="space-y-3">
      <div class="flex items-baseline gap-3">
        <div class="text-4xl font-bold text-red-600">
          ${{ calculateSalePrice(product.price) }}
        </div>
        <div class="text-2xl text-gray-400 line-through">
          ${{ product.price?.toFixed(2) }}
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <span class="inline-flex items-center px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full">
          Save {{ discountPercentage }}%
        </span>
        <span class="text-sm font-semibold text-green-600">
          You save ${{ savingsAmount.toFixed(2) }}
        </span>
      </div>

      <!-- Countdown Timer -->
      <Countdown 
        v-if="activeSale && activeSale.endDate"
        :end-date="activeSale.endDate"
        class="mt-4"
      />

      <!-- Flash Sale Info -->
      <div v-if="product.flashSale?.isFlashSale" class="p-3 mt-3 border border-yellow-200 rounded-lg bg-yellow-50">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold text-yellow-600">⚡ Flash Sale</span>
          <span class="text-gray-600">
            Only {{ product.flashSale.saleStock }} left at this price!
          </span>
        </div>
        <div v-if="product.flashSale.maxQuantityPerUser" class="mt-1 text-xs text-gray-500">
          Max {{ product.flashSale.maxQuantityPerUser }} per customer
        </div>
      </div>
    </div>

    <!-- Stock Status -->
    <div class="flex items-center gap-2 mt-4">
      <span v-if="product.countInstock > 0" class="flex items-center text-sm text-green-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        In Stock ({{ product.countInstock }} available)
      </span>
      <span v-else-if="product.countInstock === 0" class="flex items-center text-sm text-red-600">
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        Out of Stock
      </span>
      <span v-else class="text-sm text-yellow-600">
        ⚠️ Low Stock - Only {{ product.countInstock }} left!
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref,computed } from 'vue'
import Countdown from '../atoms/Countdown.vue'
const saleProgram = ref(null); 
const props = defineProps({
  product: { type: Object, required: true },
  activeSale: { type: Object, default: null }
})
const discountPercentage = computed(() => {
    return props.activeSale?.benefits?.discountPercentage || 0;
});

const calculateSalePrice = (originalPrice) => {
  const discountProgram = props.activeSale;
  
  if (!originalPrice || !discountProgram?.benefits?.discountPercentage) {
    return originalPrice?.toFixed(2) || "0.00";
  }
  
  const discount = discountProgram.benefits.discountPercentage;
  const salePrice = originalPrice * (1 - discount / 100);
  return salePrice.toFixed(2);
};
const savingsAmount = computed(() => {
    const originalPrice = props.product.price;
    if (!originalPrice) return 0;

    const salePrice = parseFloat(calculateSalePrice(originalPrice)); 

    const savings = originalPrice - salePrice;
    return Math.max(0, savings); 
});
</script>
