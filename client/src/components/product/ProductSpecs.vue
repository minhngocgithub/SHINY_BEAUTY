<template>
  <div class="product-specs">
    <h3 class="mb-6 text-xl font-bold text-gray-900">Product Specifications</h3>
    
    <dl class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">Brand</dt>
        <dd class="text-base font-semibold text-gray-900">{{ product.brand }}</dd>
      </div>
      
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">Category</dt>
        <dd class="text-base font-semibold text-gray-900">
          {{ product.category?.map(c => c.name).join(', ') || 'N/A' }}
        </dd>
      </div>
      
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">SKU</dt>
        <dd class="font-mono text-base text-gray-900">{{ product._id }}</dd>
      </div>
      
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">Availability</dt>
        <dd class="flex items-center gap-2">
          <span 
            class="w-2 h-2 rounded-full"
            :class="product.countInstock > 0 ? 'bg-green-500' : 'bg-red-500'"
          ></span>
          <span 
            class="text-base font-semibold" 
            :class="product.countInstock > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ product.countInstock > 0 ? `In Stock (${product.countInstock})` : 'Out of Stock' }}
          </span>
        </dd>
      </div>
      
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">Rating</dt>
        <dd class="flex items-center gap-2">
          <div class="flex text-yellow-400">
            <span v-for="i in 5" :key="i" class="text-lg">
              {{ i <= Math.round(product.ratings?.average || 0) ? '★' : '☆' }}
            </span>
          </div>
          <span class="text-base font-semibold text-gray-900">
            {{ product.ratings?.average?.toFixed(1) || '0.0' }}
          </span>
          <span class="text-sm text-gray-500">
            ({{ product.ratings?.count || 0 }} reviews)
          </span>
        </dd>
      </div>
      
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">Units Sold</dt>
        <dd class="text-base font-semibold text-gray-900">
          {{ product.sold || 0 }} units
        </dd>
      </div>
      
      <div v-if="product.isNewProduct" class="p-4 border border-pink-200 rounded-lg bg-pink-50">
        <dt class="mb-2 text-sm font-medium text-pink-600">Product Status</dt>
        <dd class="flex items-center gap-2">
          <span class="px-2 py-1 text-xs font-semibold text-pink-700 bg-pink-100 rounded-full">
            NEW ARRIVAL
          </span>
        </dd>
      </div>
      
      <div v-if="product.isBestSeller" class="p-4 border border-orange-200 rounded-lg bg-orange-50">
        <dt class="mb-2 text-sm font-medium text-orange-600">Popularity</dt>
        <dd class="flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-base font-semibold text-orange-600">Best Seller</span>
        </dd>
      </div>
      
      <div v-if="product.trendingScore" class="p-4 border border-purple-200 rounded-lg bg-purple-50">
        <dt class="mb-2 text-sm font-medium text-purple-600">Trending Score</dt>
        <dd class="flex items-center gap-3">
          <div class="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
            <div 
              class="h-full transition-all bg-gradient-to-r from-purple-500 to-pink-500"
              :style="{ width: product.trendingScore + '%' }"
            ></div>
          </div>
          <span class="text-base font-semibold text-purple-600">
            {{ product.trendingScore }}/100
          </span>
        </dd>
      </div>
      
      <div class="p-4 rounded-lg bg-gray-50">
        <dt class="mb-2 text-sm font-medium text-gray-500">Added On</dt>
        <dd class="text-base font-semibold text-gray-900">
          {{ new Date(product.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) }}
        </dd>
      </div>
    </dl>

    <!-- Additional Info -->
    <div v-if="product.description || product.ingredients || product.howToUse || product.features" class="mt-8 space-y-6">
      <div v-if="product.description" class="p-6 bg-white border border-gray-200 rounded-lg">
        <h4 class="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-900">
          <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Description
        </h4>
        <p class="text-sm leading-relaxed text-gray-700">{{ product.description }}</p>
      </div>

      <div v-if="product.features && product.features.length > 0" class="p-6 bg-white border border-gray-200 rounded-lg">
        <h4 class="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-900">
          <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Key Features
        </h4>
        <ul class="space-y-2">
          <li 
            v-for="(feature, index) in product.features" 
            :key="index"
            class="flex items-start gap-2 text-sm text-gray-700"
          >
            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>{{ feature }}</span>
          </li>
        </ul>
      </div>
      
      <div v-if="product.ingredients" class="p-6 bg-white border border-gray-200 rounded-lg">
        <h4 class="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-900">
          <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Ingredients
        </h4>
        <p class="text-sm leading-relaxed text-gray-700">{{ product.ingredients }}</p>
      </div>
      
      <div v-if="product.howToUse" class="p-6 bg-white border border-gray-200 rounded-lg">
        <h4 class="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-900">
          <svg class="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          How to Use
        </h4>
        <p class="text-sm leading-relaxed text-gray-700">{{ product.howToUse }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>