<template>
  <div class="related-products">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-gray-900">You May Also Like</h3>
      <span class="text-sm text-gray-500">{{ products.length }} products</span>
    </div>
    
    <div v-if="products.length === 0" class="py-12 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-gray-500">No related products found</p>
    </div>
    
    <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <router-link
        v-for="product in products"
        :key="product._id"
        :to="`/product/${product._id}`"
        class="relative p-3 transition-all duration-300 bg-white border border-gray-200 rounded-lg group hover:border-rose-300 hover:shadow-lg"
      >
        <!-- Badges -->
        <div class="absolute z-10 flex flex-col gap-1 top-5 left-5">
          <span v-if="product.isNewProduct" class="px-2 py-1 text-xs font-bold text-white bg-pink-500 rounded shadow-md">
            NEW
          </span>
          <span v-if="product.isOnSale" class="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded shadow-md">
            SALE
          </span>
          <span v-if="product.isBestSeller" class="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded shadow-md">
            HOT
          </span>
        </div>

        <!-- Product Image -->
        <div class="relative mb-3 overflow-hidden bg-gray-100 rounded-lg aspect-square">
          <img
            :src="getProductImage(product)"
            :alt="product.name"
            class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          
          <!-- Quick View Overlay -->
          <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 bg-black/30 group-hover:opacity-100">
            <button class="px-4 py-2 text-sm font-semibold text-white transition-transform rounded-lg bg-white/20 backdrop-blur-sm hover:scale-105">
              Quick View
            </button>
          </div>
        </div>
        
        <!-- Product Info -->
        <div>
          <h4 class="mb-1 text-sm font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-rose-600">
            {{ product.name }}
          </h4>
          
          <p class="mb-2 text-xs text-gray-500">{{ product.brand }}</p>
          
          <!-- Rating -->
          <div class="flex items-center gap-1 mb-2">
            <div class="flex text-yellow-400">
              <span v-for="i in 5" :key="i" class="text-sm">
                {{ i <= Math.round(product.ratings?.average || 0) ? '★' : '☆' }}
              </span>
            </div>
            <span class="text-xs text-gray-500">
              ({{ product.ratings?.count || 0 }})
            </span>
          </div>
          
          <!-- Price -->
          <div class="flex items-center justify-between">
            <div>
              <div v-if="product.isOnSale || product.salePrice" class="space-y-0.5">
                <div class="text-base font-bold text-red-600">
                  ${{ (product.salePrice || product.price).toFixed(2) }}
                </div>
                <div class="text-xs text-gray-400 line-through">
                  ${{ product.price.toFixed(2) }}
                </div>
              </div>
              <div v-else class="text-base font-bold text-gray-900">
                ${{ product.price.toFixed(2) }}
              </div>
            </div>
            
            <!-- Discount Badge -->
            <div v-if="product.discountPercentage > 0" class="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
              -{{ product.discountPercentage }}%
            </div>
          </div>

          <!-- Stock Status -->
          <div class="mt-2">
            <span 
              v-if="product.countInstock > 0 && product.countInstock <= 10"
              class="text-xs font-medium text-orange-600"
            >
              Only {{ product.countInstock }} left!
            </span>
            <span 
              v-else-if="product.countInstock === 0"
              class="text-xs font-medium text-red-600"
            >
              Out of stock
            </span>
            <span 
              v-else
              class="text-xs font-medium text-green-600"
            >
              In stock
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: {
    type: Array,
    default: () => []
  }
})

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
</script>