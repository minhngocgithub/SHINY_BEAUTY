<template>
  <div class="bundle-list">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900">
        Product Bundles & Special Offers
      </h3>
      <span class="px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full">
        Save More
      </span>
    </div>
    
    <div v-if="bundles.length === 0" class="py-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-500">No bundle offers available</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="bundle in bundles"
        :key="bundle._id"
        class="relative p-6 overflow-hidden transition-all duration-300 border-2 border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 hover:border-purple-400 hover:shadow-xl"
      >
        <!-- Background Pattern -->
        <div class="absolute top-0 right-0 opacity-10">
          <svg class="w-32 h-32 text-purple-600" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>

        <!-- Bundle Header -->
        <div class="relative flex items-start justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-3 py-1 text-xs font-bold text-purple-700 bg-purple-200 rounded-full">
                BUNDLE DEAL
              </span>
              <span v-if="bundle.stockQuantity <= 5" class="px-3 py-1 text-xs font-bold text-red-700 bg-red-200 rounded-full animate-pulse">
                Limited Stock
              </span>
            </div>
            
            <h4 class="mb-2 text-xl font-bold text-gray-900">
              {{ bundle.name }}
            </h4>
            <p class="text-sm text-gray-600">{{ bundle.description }}</p>
          </div>
          
          <!-- Price Box -->
          <div class="p-4 text-right bg-white border-2 border-purple-300 shadow-lg rounded-xl">
            <div class="text-xs font-medium text-gray-500 line-through">
              Was ${{ bundle.originalPrice?.toFixed(2) }}
            </div>
            <div class="text-3xl font-bold text-purple-600">
              ${{ bundle.bundlePrice?.toFixed(2) }}
            </div>
            <div class="flex items-center justify-center gap-1 mt-1">
              <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-bold text-green-600">
                Save ${{ (bundle.originalPrice - bundle.bundlePrice).toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bundle Products Grid -->
        <div class="relative mb-6">
          <h5 class="mb-3 text-sm font-semibold text-gray-700">
            This bundle includes {{ bundle.items?.length || 0 }} items:
          </h5>
          
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div
              v-for="(item) in bundle.items"
              :key="item.product._id"
              class="relative p-3 transition-all duration-200 bg-white border border-gray-200 rounded-lg hover:shadow-md"
            >
              <!-- Quantity Badge -->
              <div class="absolute z-10 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-purple-600 rounded-full -top-2 -right-2">
                {{ item.quantity }}x
              </div>

              <!-- Product Image -->
              <div class="mb-2 overflow-hidden bg-gray-100 rounded-lg aspect-square">
                <img
                  :src="getProductImage(item.product)"
                  :alt="item.product.name"
                  class="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              
              <!-- Product Info -->
              <p class="text-xs font-semibold text-gray-900 line-clamp-2">
                {{ item.product.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ item.product.brand }}
              </p>
              <p class="mt-1 text-xs font-bold text-purple-600">
                ${{ item.product.price?.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Bundle Features -->
        <div v-if="bundle.features && bundle.features.length > 0" class="p-4 mb-6 rounded-lg bg-white/50">
          <h5 class="mb-2 text-sm font-semibold text-gray-700">Bundle Benefits:</h5>
          <ul class="space-y-1">
            <li 
              v-for="(feature, index) in bundle.features"
              :key="index"
              class="flex items-start gap-2 text-xs text-gray-600"
            >
              <svg class="flex-shrink-0 w-4 h-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            @click="addBundleToCart(bundle)"
            :disabled="!bundle.stockQuantity || bundle.stockQuantity === 0"
            class="flex-1 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-pink-600"
          >
            <span v-if="bundle.stockQuantity && bundle.stockQuantity > 0">
              Add Bundle to Cart
            </span>
            <span v-else>Out of Stock</span>
          </button>
          
          <button
            @click="viewBundleDetails(bundle)"
            class="px-6 py-3 font-semibold text-purple-600 transition-all bg-white border-2 border-purple-600 rounded-lg hover:bg-purple-50"
          >
            Details
          </button>
        </div>

        <!-- Stock Info -->
        <div v-if="bundle.stockQuantity" class="mt-3 text-center">
          <span 
            v-if="bundle.stockQuantity <= 5"
            class="text-xs font-semibold text-red-600"
          >
            ⚠️ Only {{ bundle.stockQuantity }} bundles left in stock!
          </span>
          <span 
            v-else
            class="text-xs text-gray-500"
          >
            {{ bundle.stockQuantity }} bundles available
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

defineProps({
  bundles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-to-cart', 'view-details'])

function getProductImage(product) {
  if (Array.isArray(product.image)) {
    if (product.image.length > 0) {
      const firstImage = product.image[0]
      return firstImage?.url || firstImage || '/placeholder.png'
    }
  } else if (product.image) {
    return product.image?.url || product.image || '/placeholder.png'
  }
  return '/placeholder.png'
}

function addBundleToCart(bundle) {
  if (!bundle.stockQuantity || bundle.stockQuantity === 0) {
    alert('This bundle is out of stock')
    return
  }
  emit('add-to-cart', bundle)
  console.log('Add bundle to cart:', bundle)
}

function viewBundleDetails(bundle) {
  emit('view-details', bundle)
  console.log('View bundle details:', bundle)
}
</script>