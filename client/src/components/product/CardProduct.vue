<template>
  <div
    :class="`flex flex-col h-[330px] overflow-hidden product-card-shadow bg-white rounded-xl ${width} relative group`"
    @mouseenter="showQuickLook = true"
    @mouseleave="showQuickLook = false"
  >
    <!-- New Product Badge -->
    <div
      v-if="product.isNewProduct"
      class="absolute z-30 px-2 py-1 text-xs font-semibold text-white rounded-full shadow-lg top-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500"
    >
      New
    </div>
    <div
      v-if="product.isBestSeller"
      class="absolute z-30 px-2 py-1 text-xs font-semibold text-white rounded-full shadow-lg top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500"
    >
      Best Seller
    </div>

    <div
      v-show="showQuickLook"
      class="absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-20"
    >
      <button
        @click.stop.prevent="openQuickLook"
        class="px-4 py-1 text-xs font-medium text-white transition-colors bg-gray-700 rounded-lg sm:px-6 sm:py-1 sm:text-sm hover:bg-gray-500 z-9999"
      >
        <span class="">Quicklook</span>
      </button>
    </div>

    <LazyImg
      class-style="h-[180px] object-cover w-full"
      :src="product.imageUrl || product.image"
      alt=""
    />
    
    <div class="flex-auto p-3 capitalize">
      <p class="text-sm font-semibold text-[#191919] truncate-2 pb-2">
        {{ product.brand }}
      </p>
      <p class="text-sm font-semibold text-[#363636] truncate-2">
        {{ product.name }}
      </p>
      <p v-if="product.price" class="mt-1 text-lg font-bold">
        ${{ product.price }}
      </p>
      <p
        v-if="product?.maxPrice != undefined && product?.minPrice != undefined"
        class="mt-1 text-lg font-bold"
      >
        ${{ product?.minPrice }} - ${{ product?.maxPrice }}
      </p>
      <div>
        <i class="ri-map-pin-2-fill text-primary-200"></i>
        <span class="ml-2 text-xs text-primary-200">{{
          product.location
        }}</span>
      </div>
      <div class="text-xs text-primary-200">
        <span>
          <i class="ri-star-fill text-[#ffaa28]"></i>
          <span class="ml-2 mr-1">{{
            product.ratings?.average || product.rating || 0
          }}</span>
          <span>|</span>
          <span class="ml-1">sold {{ product.sold }}</span>
        </span>
      </div>
    </div>

    <QuickLookModal
      :is-open="isQuickLookOpen"
      :product="product"
      @close="isQuickLookOpen = false"
      @add-to-cart="handleAddToCart"
      @add-to-wishlist="handleAddToWishlist"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LazyImg from "../atoms/LazyImg.vue"
import QuickLookModal from "./QuickLookModal.vue"

defineProps({
  product: {
    type: Object,
    require: true,
  },
  width: {
    type: String,
    default: "w-[200px]",
  },
})

const showQuickLook = ref(false)
const isQuickLookOpen = ref(false)

const openQuickLook = () => {
  isQuickLookOpen.value = true
  console.log('Open quick look modal for product:');
}

const handleAddToCart = (data) => {
  console.log('Add to cart:', data)
}

const handleAddToWishlist = (product) => {
  console.log('Add to wishlist:', product)
  // Implement add to wishlist logic
}

const closeQuickLook = () => { showQuickLook.value = false }
</script>
