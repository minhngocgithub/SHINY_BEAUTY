<template>
  <div class="product-tabs"> 
    <div class="mb-8 border-b ">
      <nav class="flex gap-8 overflow-x-auto" aria-label="Product Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'relative py-4 px-2 font-medium text-base whitespace-nowrap transition-all duration-200 bg-white',
            activeTab === tab.id
              ? 'text-rose-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
          
           Active Indicator 
          <span 
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-t-full"
          ></span>
        </button>
      </nav>
    </div> 
    <div class="tab-content">
      <div v-show="activeTab === 'description'" id="description">
        <div class="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 class="mb-4 text-xl font-bold text-gray-900">Product Description</h3>
          <p class="leading-relaxed text-gray-700">{{ product.description }}</p>
          
          <div v-if="product.features && product.features.length > 0" class="mt-6">
            <h4 class="mb-3 font-semibold text-gray-900">Key Features:</h4>
            <ul class="space-y-2">
              <li 
                v-for="(feature, index) in product.features" 
                :key="index"
                class="flex items-start gap-2 text-gray-700"
              >
                <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-show="activeTab === 'additional'" id="additional">
        <ProductSpecs :product="product" />
      </div>

      <div v-show="activeTab === 'reviews'" id="reviews">
        <ReviewList 
          :product="product" 
          :reviews="reviews"
          @refresh="$emit('refresh-reviews')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ReviewList from './ReviewList.vue'
import ProductSpecs from './ProductSpecs.vue'

defineProps({
  product: {
    type: Object,
    required: true
  },
  reviews: {
    type: Array,
    default: () => []
  },
  reviewSummary: {
    type: Object,
    default: null
  },
  relatedProducts: {
    type: Array,
    default: () => []
  },
  bundles: {
    type: Array,
    default: () => []
  }
})

defineEmits(['refresh-reviews'])

const activeTab = ref('reviews')

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'additional', label: 'Additional Information' },
  { id: 'reviews', label: 'Review' }
]
</script>
