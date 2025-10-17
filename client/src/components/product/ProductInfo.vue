<template>
  <div class="space-y-6 product-info">
    <div v-if="primaryCategory" class="inline-block">
      <router-link
        :to="getCategoryLink(primaryCategory)"
        class="inline-flex items-center px-3 py-1 text-sm font-medium transition-colors rounded-full bg-rose-100 text-rose-700 hover:bg-rose-200"
      >
        {{ primaryCategory.name }}
      </router-link>
    </div>

    <div>
      <div class="flex items-start justify-between gap-4 mb-2">
        <h1 class="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          {{ product.name }}
        </h1>
        <span
          v-if="product.countInstock > 0"
          class="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          In Stock
        </span>
        <span
          v-else
          class="flex items-center gap-1 px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full whitespace-nowrap"
        >
          Out of Stock
        </span>
      </div>

      <!-- Brand -->
      <div class="mb-2">
        <router-link
          :to="`/brand/${encodeURIComponent(product.brand)}`"
          class="text-lg font-medium transition-colors text-rose-600 hover:text-rose-700"
        >
          {{ product.brand }}
        </router-link>
      </div>
    </div>

    <!-- Rating Section -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <div class="flex text-xl text-yellow-400">
          <span v-for="i in 5" :key="i">
            {{ i <= Math.floor(product.ratings?.average || 0) ? "★" : "☆" }}
          </span>
        </div>
        <span class="text-lg font-semibold text-gray-900">
          {{ (product.ratings?.average || 0).toFixed(1) }}
        </span>
      </div>

      <a
        href="#reviews"
        class="text-sm text-gray-600 transition-colors hover:text-rose-600"
      >
        ({{ product.ratings?.count || 0 }} Reviews)
      </a>
    </div>

    <!-- Price Section -->
    <div
      class="border-2 rounded-lg border-rose-100 bg-gradient-to-br from-white to-rose-50"
    >
      <PriceSection
        :product="product"
        :sale-programs="salePrograms"
        :is-on-sale="isOnSale"
        :active-sale="activeSale"
      />
    </div>

    <!-- Description -->
    <div v-if="product.description">
      <p class="text-sm leading-relaxed text-gray-700 md:text-base">
        {{ product.description }}
      </p>
    </div>

    <!-- Size/Volume Selection -->
    <div v-if="productSizes.length > 0" class="space-y-3">
      <label class="text-sm font-semibold text-gray-900">Size/Volume</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in productSizes"
          :key="size"
          @click="selectedSize = size"
          :class="[
            'px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all',
            selectedSize === size
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
          ]"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- Add to Cart Component -->
    <AddToCart
      :product="product"
      :is-processing="isProcessing"
      @add-to-cart="handleAddToCart"
      @buy-now="handleBuyNow"
    />

    <!-- Wishlist & Share Section -->
    <div class="flex gap-3 pt-4">
      <button
        @click="handleAddToWishlist"
        class="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-semibold text-gray-700 transition bg-white border-2 border-gray-300 rounded-lg hover:border-rose-500 hover:text-rose-500"
        title="Add to Wishlist"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Add to Wishlist
      </button>

      <!-- Share Button -->
      <div class="relative group">
        <button
          class="flex items-center justify-center gap-2 px-4 py-3 font-semibold text-gray-700 transition bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400"
          title="Share"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.469 9 12c0-3.038-2.688-5.5-6-5.5S-3 8.962-3 12s2.688 5.5 6 5.5c.469 0 .938-.114 1.342-.316m0 0a6 6 0 001.946 1.162m0 0c.896.235 1.862.37 2.859.37 5.512 0 10-4.477 10-10S17.512 2 12 2s-10 4.477-10 10"
            />
          </svg>
        </button>

        <!-- Share Dropdown -->
        <div
          class="absolute right-0 z-10 hidden w-48 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg group-hover:block"
        >
          <button
            @click="handleShare('facebook')"
            class="flex items-center w-full gap-3 px-4 py-2 text-left text-blue-600 transition hover:bg-gray-50"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            Facebook
          </button>

          <button
            @click="handleShare('twitter')"
            class="flex items-center w-full gap-3 px-4 py-2 text-left text-blue-400 transition hover:bg-gray-50"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
            Twitter
          </button>

          <button
            @click="handleShare('pinterest')"
            class="flex items-center w-full gap-3 px-4 py-2 text-left text-red-600 transition hover:bg-gray-50"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"
              />
            </svg>
            Pinterest
          </button>

          <button
            @click="handleShare('email')"
            class="flex items-center w-full gap-3 px-4 py-2 text-left text-gray-600 transition hover:bg-gray-50"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email
          </button>

          <button
            @click="copyToClipboard"
            class="flex items-center w-full gap-3 px-4 py-2 text-left text-gray-600 transition border-t border-gray-200 hover:bg-gray-50"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Link
          </button>
        </div>
      </div>
    </div>

    <!-- Categories/Tags Section -->
    <div v-if="displayCategories.length > 0" class="pt-4 space-y-2 border-t border-gray-200">
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span class="font-semibold text-gray-700">Tags:</span>
        <router-link
          v-for="cat in displayCategories"
          :key="cat._id"
          :to="getCategoryLink(cat)"
          class="px-2 py-1 text-xs text-gray-700 transition-colors bg-gray-100 rounded hover:bg-rose-100 hover:text-rose-700"
        >
          {{ cat.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import PriceSection from "./PriceSection.vue"
import AddToCart from "./AddToCart.vue"

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  salePrograms: {
    type: Array,
    default: () => [],
  },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  activeSale: {
    type: Object,
    default: null,
  },
  reviewSummary: {
    type: Object,
    default: null,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["add-to-cart", "buy-now", "add-wishlist", "share"])

// State
const selectedSize = ref(null)

// Computed
const primaryCategory = computed(() => {
  if (!props.product.category || !Array.isArray(props.product.category)) {
    return null
  }
  return props.product.category[0] || null
})

const displayCategories = computed(() => {
  if (!props.product.category || !Array.isArray(props.product.category)) {
    return []
  }

  const seen = new Set()
  return props.product.category.filter((cat) => {
    if (!cat || !cat._id) return false
    if (seen.has(cat._id)) return false
    seen.add(cat._id)
    return true
  })
})

const productSizes = computed(() => {
  if (props.product.sizes && Array.isArray(props.product.sizes)) {
    return props.product.sizes
  }
  return ["30ml", "60ml", "80ml", "100ml"]
})

// Methods
function getCategoryLink(cat) {
  if (!cat) return "/products"

  if (cat._id) {
    return `/category/${cat._id}`
  } else if (cat.slug) {
    return `/category/${cat.slug}`
  } else if (cat.name) {
    return `/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`
  }

  return "/products"
}

function handleAddToCart(data) {
  emit("add-to-cart", {
    ...data,
    selectedSize: selectedSize.value,
  })
}

function handleBuyNow(data) {
  emit("buy-now", {
    ...data,
    selectedSize: selectedSize.value,
  })
}

function handleAddToWishlist() {
  emit("add-wishlist", {
    product: props.product,
  })
}

function handleShare(platform) {
  const url = window.location.href
  const title = props.product.name
  const text = `Check out ${title} on our store!`

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n" + url)}`,
  }

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], "_blank", "width=600,height=400")
  }

  emit("share", platform)
}

function copyToClipboard() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert("Link copied to clipboard!")
  })
}
</script>