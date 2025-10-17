<template>
  <section class="relative w-full min-h-screen bg-gray-50">
    <SeoHead 
      v-if="product && product._id"
      :product="product" 
      :sale-programs="activeSalePrograms"
      :reviews="reviews"
    />

    <Header />

    <div class="w-full bg-white border-b border-gray-200">
      <div class="px-2 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Breadcrumb :items="breadcrumbItems" />
      </div>
    </div>

    <div class="px-2 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <Loading />
      </div>

      <div v-else-if="error" class="py-12 text-center">
        <div class="max-w-md p-6 mx-auto bg-white border border-red-200 rounded-lg shadow-sm">
          <svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mb-4 text-lg font-semibold text-red-600">{{ error }}</p>
          <button 
            @click="fetchProductData" 
            class="px-6 py-2 text-white transition rounded-lg bg-rose-600 hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      </div>

      <div v-else-if="product._id">
        <Transition name="fade">
          <div v-if="successMessage" class="fixed z-50 p-4 text-white bg-green-500 rounded-lg shadow-lg top-4 right-4">
            {{ successMessage }}
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="errorMessage" class="fixed z-50 p-4 text-white bg-red-500 rounded-lg shadow-lg top-4 right-4">
            {{ errorMessage }}
          </div>
        </Transition>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div class="p-6 bg-white shadow-sm rounded-xl">
            <ProductGallery 
              v-if="productImages.length > 0"
              :images="productImages" 
              :video="product.videoUrl"
              :product-name="product.name"
            />
          </div>

          <div class="p-6 bg-white shadow-sm rounded-xl">
            <ProductInfo 
              :product="product"
              :sale-programs="activeSalePrograms"
              :is-on-sale="isOnSale"
              :active-sale="activeSale"
              :review-summary="reviewSummary"
              :is-processing="isProcessing"
              @add-to-cart="handleAddToCart"
              @buy-now="handleBuyNow"
              @add-wishlist="handleAddWishlist"
              @share="handleShare"
            />
          </div>
        </div>

        <div class="p-6 mt-12 bg-white shadow-sm rounded-xl">
          <ProductTabs
            :product="product"
            :reviews="reviews"
            :review-summary="reviewSummary"
            :related-products="relatedProducts"
            :bundles="bundles"
            @refresh-reviews="fetchReviews"
          />
        </div>

        <div class="mt-12">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Header from "../components/Header.vue"
import SeoHead from "../components/commons/SeoHead.vue"
import Breadcrumb from "../components/commons/BreadCrumb.vue"
import ProductGallery from "../components/product/ProductGallery.vue"
import ProductInfo from "../components/product/ProductInfo.vue"
import ProductTabs from "../components/product/ProductTabs.vue"
import RecentlyViewed from "../components/product/RecentlyView.vue"
import Loading from "../components/Loading.vue"

import { getProductApi, getRelatedProductsApi } from "../service/product.service"
import { getActiveSaleProgramsApi } from "../service/saleProgram.service"
import { getReviewsByProductApi, getProductReviewSummaryApi } from "../service/review.service"
import { getBundlesByProductApi } from "../service/bundle.service"
import { useCartStore } from "../store/cart.store"
import { useWishlistStore } from "../store/wishlist.store"
import { useAuthStore } from "../store/auth.store"

const route = useRoute()
const router = useRouter()

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const authStore = useAuthStore()

const productId = route.params.id

const product = ref({})
const activeSalePrograms = ref([])
const reviews = ref([])
const reviewSummary = ref(null)
const relatedProducts = ref([])
const bundles = ref([])
const loading = ref(true)
const error = ref(null)
const successMessage = ref(null)
const errorMessage = ref(null)
const isProcessing = ref(false)

const saleProgramIdFromUrl = computed(() => {
  return route.query.saleProgramId || route.query.saleId || null
})

const isOnSale = computed(() => {
  return (
    product.value.isOnSale ||
    (product.value.salePrice && product.value.salePrice < product.value.price) ||
    activeSalePrograms.value.some((p) => p.isCurrentlyActive)
  )
})

const activeSale = computed(() => {
  if (saleProgramIdFromUrl.value && activeSalePrograms.value.length > 0) {
    const programFromUrl = activeSalePrograms.value.find(
      (p) =>
        p.id === saleProgramIdFromUrl.value ||
        p._id === saleProgramIdFromUrl.value ||
        p.slug === saleProgramIdFromUrl.value
    )

    if (programFromUrl && programFromUrl.isCurrentlyActive) {
      return programFromUrl
    }
  }

  if (product.value.isOnSale && product.value.discountPercentage) {
    return {
      endDate: product.value.saleEndDate || null,
      type: "product_sale",
      benefits: {
        discountPercentage: product.value.discountPercentage,
      },
    }
  }

  const flashSale = activeSalePrograms.value.find(
    (p) => p.type === "flash_sale" && p.isCurrentlyActive
  )
  if (flashSale) {
    return flashSale
  }

  const sortedPrograms = [...activeSalePrograms.value]
    .filter((p) => p.isCurrentlyActive && p.benefits?.discountPercentage > 0)
    .sort((a, b) => (b.benefits?.discountPercentage || 0) - (a.benefits?.discountPercentage || 0))

  if (sortedPrograms.length > 0) {
    return sortedPrograms[0]
  }

  return null
})

const productImages = computed(() => {
  const images = []
  if (product.value.image) {
    if (Array.isArray(product.value.image)) {
      images.push(...product.value.image.map((img) => img.url || img))
    } else {
      images.push(product.value.image.url || product.value.image)
    }
  }
  return images
})

const breadcrumbItems = computed(() => {
  const items = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" },
  ]

  if (product.value.category && Array.isArray(product.value.category)) {
    product.value.category.forEach((cat) => {
      if (cat && cat.name) {
        items.push({
          label: cat.name,
          to: `/category/${
            cat._id || cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")
          }`,
        })
      }
    })
  }

  items.push({
    label: "Product Details",
    to: route.fullPath,
  })

  return items
})

function showSuccessMessage(message) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

function showErrorMessage(message) {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = null
  }, 3000)
}

async function fetchReviews() {
  try {
    const [reviewsRes, reviewSummaryRes] = await Promise.allSettled([
      getReviewsByProductApi(productId, { type: "rating", limit: 10 }),
      getProductReviewSummaryApi(productId),
    ])

    if (reviewsRes.status === "fulfilled") {
      reviews.value = reviewsRes.value.data.reviews || []
    }

    if (reviewSummaryRes.status === "fulfilled") {
      reviewSummary.value = reviewSummaryRes.value.data.summary || null
    }
  } catch (err) {
    console.error("Error fetching reviews:", err)
  }
}

async function fetchProductData() {
  try {
    loading.value = true
    error.value = null

    const productRes = await getProductApi(productId)
    product.value = productRes.data.productData

    const saleProgramParams = {
      productId: productId,
    }

    if (saleProgramIdFromUrl.value) {
      saleProgramParams.saleProgramId = saleProgramIdFromUrl.value
    }

    const [saleProgramsRes, relatedRes, bundlesRes] = await Promise.allSettled([
      getActiveSaleProgramsApi(saleProgramParams),
      getRelatedProductsApi(productId, { limit: 8 }),
      getBundlesByProductApi(productId),
    ])

    if (saleProgramsRes.status === "fulfilled") {
      activeSalePrograms.value = saleProgramsRes.value.data.salePrograms || []
    }

    if (relatedRes.status === "fulfilled") {
      relatedProducts.value = relatedRes.value.data.products || []
    }

    if (bundlesRes.status === "fulfilled") {
      bundles.value = bundlesRes.value.data.bundles || []
    }

    await fetchReviews()
    trackProductView()
    saveToRecentlyViewed()
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load product"
    console.error("Product fetch error:", err)
  } finally {
    loading.value = false
  }
}

function trackProductView() {
  if (window.gtag) {
    window.gtag("event", "view_item", {
      currency: "USD",
      value: product.value.price,
      items: [
        {
          item_id: product.value._id,
          item_name: product.value.name,
          item_brand: product.value.brand,
          item_category: product.value.category?.[0]?.name || "Uncategorized",
          price: product.value.price,
        },
      ],
    })
  }
}

function saveToRecentlyViewed() {
  const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
  const filtered = recent.filter((id) => id !== productId)
  filtered.unshift(productId)
  localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 12)))
}

async function handleAddToCart({ product: cartProduct, quantity, selectedSize }) {
  try {
    if (isProcessing.value) return
    isProcessing.value = true

    if (!cartProduct || !cartProduct._id) {
      showErrorMessage("Invalid product")
      return
    }

    await cartStore.addToCart({
      product: cartProduct,
      quantity,
    })

    showSuccessMessage(`Added ${quantity}x ${cartProduct.name} to cart`)
    
    if (window.gtag) {
      window.gtag("event", "add_to_cart", {
        currency: "USD",
        value: cartProduct.price * quantity,
        items: [
          {
            item_id: cartProduct._id,
            item_name: cartProduct.name,
            item_brand: cartProduct.brand,
            quantity: quantity,
            price: cartProduct.price,
          },
        ],
      })
    }
  } catch (err) {
    showErrorMessage(err.message || "Failed to add to cart")
    console.error("Add to cart error:", err)
  } finally {
    isProcessing.value = false
  }
}

async function handleBuyNow({ product: buyProduct, quantity, selectedSize }) {
  try {
    if (isProcessing.value) return
    isProcessing.value = true

    if (!buyProduct || !buyProduct._id) {
      showErrorMessage("Invalid product")
      return
    }

    await cartStore.addToCart({
      product: buyProduct,
      quantity,
    })

    showSuccessMessage("Proceeding to checkout...")
    
    if (window.gtag) {
      window.gtag("event", "begin_checkout", {
        currency: "USD",
        value: buyProduct.price * quantity,
        items: [
          {
            item_id: buyProduct._id,
            item_name: buyProduct.name,
            item_brand: buyProduct.brand,
            quantity: quantity,
            price: buyProduct.price,
          },
        ],
      })
    }

    setTimeout(() => {
      router.push("/checkout")
    }, 800)
  } catch (err) {
    showErrorMessage(err.message || "Failed to proceed to checkout")
    console.error("Buy now error:", err)
  } finally {
    isProcessing.value = false
  }
}

async function handleAddWishlist() {
  try {
    if (isProcessing.value) return
    isProcessing.value = true

    if (!authStore.state.isLoggedIn) {
      showErrorMessage("Please log in to add items to wishlist")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
      return
    }

    const result = await wishlistStore.toggleWishlist(product.value)

    if (result.action === "added") {
      showSuccessMessage("Added to wishlist")
    } else {
      showSuccessMessage("Removed from wishlist")
    }
    
    if (window.gtag) {
      window.gtag("event", "add_to_wishlist", {
        currency: "USD",
        value: product.value.price,
        items: [
          {
            item_id: product.value._id,
            item_name: product.value.name,
            item_brand: product.value.brand,
            price: product.value.price,
          },
        ],
      })
    }
  } catch (err) {
    showErrorMessage(err.message || "Failed to update wishlist")
    console.error("Wishlist error:", err)
  } finally {
    isProcessing.value = false
  }
}

function handleShare(platform) {
  const url = window.location.href
  const title = product.value.name

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  }

  if (shareUrls[platform]) {
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer")
  }

  if (window.gtag) {
    window.gtag("event", "share", {
      method: platform,
      content_type: "product",
      item_id: product.value._id,
    })
  }
}

onMounted(() => {
  fetchProductData()
})

watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchProductData()
    }
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>