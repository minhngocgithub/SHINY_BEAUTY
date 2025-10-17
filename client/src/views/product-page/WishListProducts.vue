<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <!-- Loading State -->
    <div v-if="loading" class="px-4 py-8 mx-auto max-w-7xl">    
      <Loading />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-4 py-12 mx-auto max-w-7xl">
      <div class="p-6 text-center bg-red-50 rounded-xl">
        <p class="mb-4 text-red-800">{{ error }}</p>
        <button
          @click="fetchWishlistData"
          class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <div v-else class="px-4 py-6 mx-auto max-w-7xl">
      <!-- Breadcrumb -->
      <div class="mb-4 text-sm breadcrumb">
        <router-link to="/" class="text-blue-600 hover:underline">Home</router-link>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-600">Wishlist</span>
      </div>

      <h1 class="mb-6 text-3xl font-bold">❤️ My Wishlist</h1>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left: Products Grid -->
        <div class="lg:col-span-2">
          <!-- Filter & Sort -->
          <div class="p-4 mb-6 bg-white shadow-sm rounded-xl">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                <span class="font-semibold text-gray-800">
                  {{ wishlistStore.wishlistCount }} Items in Wishlist
                </span>
              </div>

              <!-- Sort -->
              <select
                v-model="sortBy"
                @change="applySorting"
                class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          <!-- Products Grid -->
          <div v-if="sortedWishlistItems.length > 0" class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3">
            <div
              v-for="item in paginatedWishlistItems"
              :key="item._id"
              class="overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-xl hover:shadow-lg hover:-translate-y-1 group"
            >
              <!-- Product Image -->
              <div class="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  :src="item.product?.image?.[0]?.url || item.product?.images?.[0] || '/api/placeholder/300/300'"
                  :alt="item.product?.name"
                  class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />

                <!-- Price Badge -->
                <div
                  v-if="item.product?.salePrice"
                  class="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-2 right-2"
                >
                  -{{ calculateDiscount(item.product.price, item.product.salePrice) }}%
                </div>

                <!-- Actions -->
                <div class="absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/50">
                  <button
                    @click.stop="goToProductDetail(item.product)"
                    class="p-2 transition-colors bg-white rounded-full hover:bg-gray-200"
                    title="View Details"
                  >
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click.stop="addToCheckout(item.product)"
                    class="p-2 transition-colors bg-blue-600 rounded-full hover:bg-blue-700"
                    title="Add to Checkout"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  <button
                    @click.stop="removeFromWishlist(item.product._id)"
                    class="p-2 transition-colors bg-red-600 rounded-full hover:bg-red-700"
                    title="Remove"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-3 space-y-1.5">
                <p class="text-xs tracking-wide text-gray-500 uppercase">
                  {{ item.product?.brand || "Brand" }}
                </p>

                <h3
                  @click="goToProductDetail(item.product)"
                  class="text-sm font-semibold text-gray-900 transition-colors cursor-pointer line-clamp-2 hover:text-blue-600"
                >
                  {{ item.product?.name }}
                </h3>

                <!-- Rating -->
                <div class="flex items-center gap-1">
                  <div class="flex">
                    <svg
                      v-for="i in 5"
                      :key="i"
                      class="w-3 h-3"
                      :class="
                        i <= Math.round(item.product?.ratings?.average || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      "
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span class="ml-2 text-xs text-gray-500">
                    ({{ item.product?.ratings?.count || 0 }})
                  </span>
                </div>

                <!-- Price -->
                <div class="flex items-baseline gap-2 pt-1">
                  <span class="text-lg font-bold text-blue-600">
                    ${{ (item.product?.salePrice || item.product?.price).toFixed(2) }}
                  </span>
                  <span v-if="item.product?.salePrice" class="text-xs text-gray-400 line-through">
                    ${{ item.product?.price?.toFixed(2) }}
                  </span>
                </div>

                <!-- Added Date -->
                <p class="text-xs text-gray-400">
                  Added {{ formatDate(item.addedAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="py-16 text-center">
            <svg class="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 class="mb-2 text-xl font-semibold text-gray-700">Wishlist is Empty</h3>
            <p class="mb-4 text-gray-500">Start adding items to your wishlist!</p>
            <router-link
              to="/"
              class="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </router-link>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            <button
              v-for="page in displayPages"
              :key="page"
              @click="currentPage = page"
              :class="page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
              class="px-4 py-2 text-sm font-medium rounded-lg"
            >
              {{ page }}
            </button>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Right: Checkout Summary -->
        <div class="lg:col-span-1">
          <div class="sticky overflow-hidden shadow-lg top-4 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl">
            <div class="p-6 text-white">
              <h3 class="mb-4 text-xl font-bold">Checkout</h3>

              <!-- Selected Items -->
              <div class="mb-4 space-y-2 overflow-y-auto max-h-64">
                <div
                  v-for="item in selectedCheckoutItems"
                  :key="item._id"
                  class="flex items-center justify-between p-2 text-sm rounded bg-white/20"
                >
                  <span class="line-clamp-1">{{ item.product?.name }}</span>
                  <button
                    @click="removeFromCheckout(item.product._id)"
                    class="text-red-300 hover:text-red-100"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Summary -->
              <div class="pt-4 mb-6 space-y-2 border-t border-white/30">
                <div class="flex justify-between text-sm">
                  <span>Subtotal ({{ selectedCheckoutItems.length }})</span>
                  <span>${{ checkoutSubtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${{ shippingCost.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between pt-2 text-lg font-bold border-t border-white/30">
                  <span>Total</span>
                  <span>${{ checkoutTotal.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Checkout Button -->
              <button
                @click="proceedToCheckout"
                :disabled="selectedCheckoutItems.length === 0 || isCheckingOut"
                class="w-full px-4 py-3 font-bold text-blue-600 transition-colors bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isCheckingOut ? 'Processing...' : 'Proceed to Checkout' }}
              </button>

              <!-- Clear Selection -->
              <button
                @click="clearCheckoutSelection"
                :disabled="selectedCheckoutItems.length === 0"
                class="w-full px-4 py-2 mt-2 text-sm font-semibold text-white transition-colors border border-white rounded-lg hover:bg-white/20 disabled:opacity-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '../../store/wishlist.store'
import { useCartStore } from '../../store/cart.store'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import Loading from '../../components/Loading.vue'
import CheckoutPayment from '../checkout/CheckoutPayment.vue'
const router = useRouter()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

// State
const loading = ref(true)
const error = ref(null)
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 12
const selectedCheckoutItems = ref([])
const isCheckingOut = ref(false)
const shippingCost = ref(9.99)

// Fetch wishlist data on mount
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    await wishlistStore.fetchWishlist()
  } catch (err) {
    error.value = err.message || 'Failed to load wishlist'
  } finally {
    loading.value = false
  }
})

// Computed
const sortedWishlistItems = computed(() => {
  let items = [...wishlistStore.formattedWishlistItems]

  switch (sortBy.value) {
    case 'newest':
      items.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      break
    case 'oldest':
      items.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
      break
    case 'price_asc':
      items.sort((a, b) => (a.product?.salePrice || a.product?.price) - (b.product?.salePrice || b.product?.price))
      break
    case 'price_desc':
      items.sort((a, b) => (b.product?.salePrice || b.product?.price) - (a.product?.salePrice || a.product?.price))
      break
    case 'rating':
      items.sort((a, b) => (b.product?.ratings?.average || 0) - (a.product?.ratings?.average || 0))
      break
  }

  return items
})

const totalPages = computed(() => {
  return Math.ceil(sortedWishlistItems.value.length / itemsPerPage)
})

const paginatedWishlistItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedWishlistItems.value.slice(start, end)
})

const displayPages = computed(() => {
  const pages = []
  const maxDisplay = 5
  const total = totalPages.value
  let start = Math.max(1, currentPage.value - Math.floor(maxDisplay / 2))
  let end = Math.min(total, start + maxDisplay - 1)

  if (end - start < maxDisplay - 1) {
    start = Math.max(1, end - maxDisplay + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const checkoutSubtotal = computed(() => {
  return selectedCheckoutItems.value.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.price || 0
    return sum + price
  }, 0)
})

const checkoutTotal = computed(() => {
  return checkoutSubtotal.value + shippingCost.value
})

// Methods
const applySorting = () => {
  currentPage.value = 1
}

const calculateDiscount = (original, sale) => {
  return Math.round(((original - sale) / original) * 100)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const goToProductDetail = (product) => {
  router.push(`/products/${product.slug || product._id}`)
}

const addToCheckout = (product) => {
  const exists = selectedCheckoutItems.value.some(item => item._id === product._id)
  if (!exists) {
    const wishlistItem = wishlistStore.wishlistItems.find(item => item.product._id === product._id)
    selectedCheckoutItems.value.push(wishlistItem)
  }
}

const removeFromCheckout = (productId) => {
  selectedCheckoutItems.value = selectedCheckoutItems.value.filter(
    item => item.product._id !== productId
  )
}

const clearCheckoutSelection = () => {
  selectedCheckoutItems.value = []
}

const removeFromWishlist = async (productId) => {
  try {
    await wishlistStore.removeFromWishlist(productId)
    removeFromCheckout(productId)
  } catch (err) {
    error.value = err.message || 'Failed to remove item'
  }
}

const fetchWishlistData = async () => {
  try {
    loading.value = true
    error.value = null
    await wishlistStore.fetchWishlist()
  } catch (err) {
    error.value = err.message || 'Failed to load wishlist'
  } finally {
    loading.value = false
  }
}

const proceedToCheckout = async () => {
  try {
    isCheckingOut.value = true
    
    // Store selected items for checkout page
    sessionStorage.setItem(
      'checkoutItems',
      JSON.stringify(selectedCheckoutItems.value)
    )

    // Navigate to checkout/payment page
    router.push('/checkout')
  } catch (err) {
    error.value = err.message || 'Failed to proceed to checkout'
  } finally {
    isCheckingOut.value = false
  }
}
</script>