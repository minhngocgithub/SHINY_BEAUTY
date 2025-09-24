<template>
  <div
    :class="`flex flex-col h-[330px] overflow-hidden product-card-shadow bg-white rounded-xl ${width} relative group shadow-[0_3px_10px_rgb(0,0,0,0.3)]`"
    @mouseenter="showQuickLook = true"
    @mouseleave="showQuickLook = false"
  >
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

    <!-- Image section - fixed height -->
    <LazyImg
      class-style="h-[180px] object-cover w-full flex-shrink-0"
      :src="product.imageUrl || product.image"
      alt=""
    />

    <!-- Content section - structured layout -->
    <div class="flex flex-col flex-1 p-3 capitalize">
      <!-- Brand - fixed height -->
      <p class="text-sm font-semibold text-[#191919] truncate h-5 mb-2">
        {{ product.brand }}
      </p>
      
      <!-- Product name - fixed height for 2 lines -->
      <p class="text-sm font-semibold text-[#363636] h-10 mb-2 leading-5 overflow-hidden">
        {{ product.name }}
      </p>
      
      <!-- Price section -->
      <div class="mb-2">
        <p v-if="product.price" class="text-lg font-bold text-[#f88113]">
          ${{ product.price }}
        </p>
        <p
          v-if="product?.maxPrice != undefined && product?.minPrice != undefined"
          class="text-lg font-bold"
        >
          ${{ product?.minPrice }} - ${{ product?.maxPrice }}
        </p>
      </div>
      
      <!-- Rating section - pushed to bottom -->
      <div class="flex justify-center mt-auto text-xs text-primary-200 align-center">
        <span class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4 text-[#f88113] mr-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
          <span class="">{{
            product.ratings?.average || product.rating || 0
          }}</span>
          <span class="mx-2">|</span>
          <span class="">sold {{ product.sold }}</span>
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
import { ref } from "vue";
import LazyImg from "../atoms/LazyImg.vue";
import QuickLookModal from "./QuickLookModal.vue";

defineProps({
  product: {
    type: Object,
    require: true,
  },
  width: {
    type: String,
    default: "w-[200px]",
  },
});

const showQuickLook = ref(false);
const isQuickLookOpen = ref(false);

const openQuickLook = () => {
  isQuickLookOpen.value = true;
  console.log("Open quick look modal for product:");
};

const handleAddToCart = (data) => {
  console.log("Add to cart:", data);
};

const handleAddToWishlist = (product) => {
  console.log("Add to wishlist:", product);
  // Implement add to wishlist logic
};

const closeQuickLook = () => {
  showQuickLook.value = false;
};
</script>
