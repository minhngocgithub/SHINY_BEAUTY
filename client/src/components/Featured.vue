<template>
  <section 
    class="relative w-full px-4 py-16 overflow-hidden md:px-8 lg:px-16"
    data-aos="fade-up"
    data-aos-duration="1000"
    data-aos-once="true"
  >
    <!-- Loading State -->
    <div v-if="loading" class="relative mx-auto max-w-7xl">
      <div class="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
        <div class="relative">
          <div class="bg-stone-200 rounded-3xl p-8 md:p-12 min-h-[500px] animate-pulse">
            <div class="w-full h-64 bg-stone-300 rounded-2xl"></div>
          </div>
        </div>
        <div class="space-y-6">
          <div class="h-4 rounded bg-stone-300 animate-pulse"></div>
          <div class="h-12 rounded bg-stone-300 animate-pulse"></div>
          <div class="h-20 rounded bg-stone-300 animate-pulse"></div>
          <div class="h-8 rounded bg-stone-300 animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- No Products State -->
    <div v-else-if="!loading && products.length === 0" class="relative py-20 mx-auto text-center max-w-7xl">
      <h3 class="mb-4 text-2xl font-semibold text-stone-600">No featured products available</h3>
      <p class="text-stone-500">Check back later for our latest featured products.</p>
    </div>

    <!-- Main Content -->
    <div v-else class="relative mx-auto max-w-7xl">
        <div 
        class="absolute inset-0 opacity-5"
        data-aos="zoom-in"
        data-aos-duration="1500"
        data-aos-delay="200"
        >
            <div class="absolute w-32 h-32 rounded-full top-10 left-10 bg-rose-200 blur-3xl"></div>
            <div class="absolute w-40 h-40 rounded-full bottom-10 right-10 bg-amber-200 blur-3xl"></div>
        </div>
    </div>
    <div class="relative mx-auto max-w-7xl">
      <div class="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
        
        <!-- Left side - Product Image -->
        <div 
          class="relative group"
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <!-- Main product container -->
          <div class="relative rounded-3xl overflow-hidden min-h-[500px] bg-gradient-to-br from-stone-50 to-stone-100 group-hover:shadow-2xl transition-all duration-700">
            <!-- Product image - Full container -->
            <div class="relative w-full h-full min-h-[500px] overflow-hidden">
              <img 
                :src="currentProductImage" 
                :alt="currentProduct?.name || 'Featured Product'"
                class="absolute inset-0 object-cover w-full h-full transition-all duration-700 ease-out group-hover:scale-110"
                loading="lazy"
              />
              
              <!-- Overlay gradient for better text readability -->
              <div class="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:opacity-100"></div>
            </div>

            <!-- Floating badges - Top left -->
            <div 
              class="absolute z-10 flex flex-col gap-2 top-6 left-6"
              data-aos="fade-down"
              data-aos-duration="600"
              data-aos-delay="800"
            >
              <div class="px-4 py-2 text-sm font-semibold capitalize border rounded-full shadow-lg bg-white/95 backdrop-blur-sm text-stone-800 border-white/20">
                {{ currentProduct?.brand || 'Premium' }}
              </div>

              <div v-if="currentProduct?.isOnSale" class="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg animate-pulse">
                SALE {{ currentProduct.discountPercentage }}%
              </div>
            </div>

            <!-- Rating và sold info - Bottom right - Only show on hover -->
            <div 
              class="absolute z-10 px-4 py-2 text-sm transition-all duration-500 transform translate-y-4 border shadow-lg opacity-0 bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl text-stone-700 border-white/20 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="flex items-center gap-3">
                <!-- Rating -->
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 fill-current text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="font-semibold">{{ (currentProduct?.ratings?.average || 0).toFixed(1) }}</span>
                </div>
                
                <div class="w-px h-4 bg-stone-300"></div>
                
                <!-- Sold count -->
                <span class="text-stone-600">
                  {{ currentProduct?.sold || 0 }} sold
                </span>
              </div>
            </div>

            <!-- Quick action button - Center, only on hover -->
            <div class="absolute inset-0 z-10 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100">
              <button 
                @click="viewProduct(currentProduct)"
                class="px-8 py-3 font-semibold transition-all duration-300 transform scale-95 border rounded-full shadow-xl bg-white/95 backdrop-blur-sm text-stone-800 border-white/20 group-hover:scale-100 hover:bg-white hover:shadow-2xl"
              >
                View Details
              </button>
            </div>
          </div>

          <!-- Collection info -->
          <div 
            class="flex items-center justify-between mt-6 text-sm text-stone-600"
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="1200"
          >
          </div>
        </div>

        <!-- Right side - Content -->
        <div 
          class="space-y-8"
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-delay="400"
        >
          <!-- Header section -->
          <div class="space-y-6">
            <div 
              class="flex items-center pb-5 font-medium tracking-wider uppercase gap-2text-sm text-stone-500"
              data-aos="fade-right"
              data-aos-duration="800"
              data-aos-delay="600"
            >
              <span class="h-px w-14 bg-stone-500"></span>
              <span class="text-xl font-bold">Featured</span>
              <span class="h-px w-14 bg-stone-500"></span>
            </div>

            <h2 
              class="text-4xl font-light leading-tight md:text-5xl lg:text-5xl text-stone-900 line-clamp-2"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="700"
            >
              <span 
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="800"
              >
                Discover
              </span>
              <span 
                class="block font-normal text-stone-700"
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="900"
              >
                {{ currentProduct?.brand || 'Premium' }}
              </span>
              <span 
                class="block"
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay="1000"
              >
                {{ currentProduct?.name || 'beauty awaits you' }}
              </span>
            </h2>

            <p 
              class="max-w-md text-lg leading-relaxed text-stone-600 line-clamp-4"
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="1100"
            >
              {{ currentProduct?.description || 'Experience the transformative power of our premium collection, meticulously crafted to enhance your natural beauty.' }}
            </p>

            <!-- Price section -->
            <div 
              v-if="currentProduct" 
              class="flex items-baseline gap-4"
              data-aos="zoom-in"
              data-aos-duration="600"
              data-aos-delay="1200"
            >
              <span class="text-2xl font-bold text-stone-900">
                {{ currentProduct.salePrice || currentProduct.price }}$
              </span>
              <span v-if="currentProduct.salePrice && currentProduct.originalPrice" 
                    class="text-lg line-through text-stone-500">
                {{ currentProduct.originalPrice }}$
              </span>
            </div>
          </div>

          <!-- Product metrics -->
          <div 
            v-if="currentProduct?.featuredMetrics" 
            class="grid grid-cols-3 gap-4 py-4 border-t border-stone-200"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="1300"
          >
            <div 
              class="text-center"
              data-aos="zoom-in"
              data-aos-duration="400"
              data-aos-delay="1400"
            >
              <div class="text-lg font-semibold text-stone-900">{{ currentProduct.featuredMetrics.views || 0 }}</div>
              <div class="text-xs text-stone-500">Views</div>
            </div>
            <div 
              class="text-center"
              data-aos="zoom-in"
              data-aos-duration="400"
              data-aos-delay="1500"
            >
              <div class="text-lg font-semibold text-stone-900">{{ currentProduct.featuredMetrics.clicks || 0 }}</div>
              <div class="text-xs text-stone-500">Clicks</div>
            </div>
            <div 
              class="text-center"
              data-aos="zoom-in"
              data-aos-duration="400"
              data-aos-delay="1600"
            >
              <div class="text-lg font-semibold text-stone-900">{{ currentProduct.featuredMetrics.ctr || 0 }}%</div>
              <div class="text-xs text-stone-500">CTR</div>
            </div>
          </div>

          <!-- CTA Button -->
          <div 
            class="pt-4 space-y-4"
            data-aos="fade-up"
            data-aos-duration="800"
            data-aos-delay="1400"
          >
            <div class="flex flex-col gap-4 sm:flex-row">
              <button 
                @click="viewProduct(currentProduct)"
                class="px-8 py-4 font-semibold text-white transition-all duration-300 group bg-stone-900 rounded-2xl hover:bg-stone-800 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                data-aos="zoom-in"
                data-aos-duration="400"
                data-aos-delay="1500"
              >
                <span class="flex items-center justify-center gap-2">
                  <span>View Product</span>
                  <svg class="w-4 h-4 transition-transform duration-200 transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
              
              <button 
                @click="handleNext"
                class="px-6 py-4 font-medium transition-all duration-300 border-2 group border-stone-300 text-stone-700 rounded-2xl hover:border-stone-900 hover:text-stone-900 hover:shadow-lg hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                data-aos="fade-right"
                data-aos-duration="600"
                data-aos-delay="1600"
              >
                <span class="flex items-center justify-center gap-2">
                  <span>Next Product</span>
                  <div class="flex items-center justify-center w-6 h-6 transition-transform duration-300 border-2 border-current rounded-full group-hover:rotate-90">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </span>
              </button>
            </div>
            
            <!-- Progress indicator -->
            <div class="flex items-center justify-center gap-2 mt-6">
              <div 
                v-for="(_, index) in products" 
                :key="index"
                class="w-2 h-2 transition-all duration-300 rounded-full"
                :class="currentIndex === index 
                  ? 'bg-stone-900 w-8' 
                  : 'bg-stone-300 hover:bg-stone-400'"
                @click="setCurrentProduct(index)"
              ></div>
            </div>
          </div>

          <div 
            class="flex gap-3 pt-4 overflow-x-auto scrollbar-hide"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="1700"
          >
          
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  getFeaturedProductApi,
  getFeaturedByTypeApi,
  trackFeaturedInteractionApi,
} from "../service/product.service";
import Loading from "../components/Loading.vue"
import { refreshAOS } from "../../utils/aos";
import LoadingVue from "./Loading.vue";

const router = useRouter();

const props = defineProps({
  limit: {
    type: Number,
    default: 5,
  },
  featuredType: {
    type: String,
    default: "homepage",
  },
});

const products = ref([]);
const currentIndex = ref(0);
const loading = ref(false);

const currentProduct = computed(() => products.value[currentIndex.value]);

const currentProductImage = computed(() => {
  const product = currentProduct.value;
  if (!product) return "/api/placeholder/200/150";

  if (Array.isArray(product.image) && product.image.length > 0) {
    return product.image[0].url;
  }

  // Handle single image object
  if (product.image && product.image.url) {
    return product.image.url;
  }

  return "/api/placeholder/200/150";
});

const featuredCollectionName = computed(() => {
  const product = currentProduct.value;
  if (!product) return "Featured collection";

  return `${product.featuredType || "Featured"} collection`;
});

const getProductImage = (product) => {
  if (!product) return "/api/placeholder/200/150";

  if (Array.isArray(product.image) && product.image.length > 0) {
    return product.image[0].url;
  }

  if (product.image && product.image.url) {
    return product.image.url;
  }

  return "/api/placeholder/200/150";
};


const formatDate = (date) => {
  if (!date) return new Date().getFullYear();

  const d = new Date(date);
  return d.getFullYear();
};

const fetchFeaturedProducts = async () => {
  try {
    loading.value = true;
    const response = await getFeaturedProductApi({
      limit: props.limit,
      featuredType: props.featuredType,
    });

    if (response.data?.status === "success") {
      products.value = response.data.data?.products || [];

      products.value = products.value.filter((product) => {
        return (
          product.featured === true &&
          product.countInstock > 0 &&
          (!product.featuredExpiry ||
            new Date(product.featuredExpiry) > new Date())
        );
      });

      if (products.value.length === 0) {
        console.warn("No featured products found");
      }
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
  } finally {
    loading.value = false;
  }
};

const setCurrentProduct = (index) => {
  currentIndex.value = index;

  // Track featured views (based on your model)
  const product = products.value[index];
  if (product && product._id) {
    trackFeaturedView(product._id);
  }
};

const trackFeaturedView = async (productId) => {
  try {
    // Call API to increment featured views
    // This should match your backend endpoint
    // await incrementFeaturedViewApi(productId)
  } catch (error) {
    console.error("Error tracking featured view:", error);
  }
};

const viewProduct = (product) => {
  if (product && product._id) {
    trackFeaturedClick(product._id);
    router.push(`/products/${product._id}`);
  }
};

const trackFeaturedClick = async (productId) => {
  try {
    // Call API to increment featured clicks
    // await incrementFeaturedClickApi(productId)
  } catch (error) {
    console.error("Error tracking featured click:", error);
  }
};

const handleNext = () => {
  if (currentIndex.value < products.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

// Auto-rotate products
let rotateInterval = null;
const startAutoRotate = () => {
  rotateInterval = setInterval(() => {
    if (products.value.length > 1) {
      handleNext();
    }
  }, 5000); // Change every 5 seconds
};

// Lifecycle
onMounted(async () => {
  await fetchFeaturedProducts();
  await nextTick();
  setTimeout(() => {
    refreshAOS();
  }, 100);

  startAutoRotate();
});

// Cleanup
onBeforeUnmount(() => {
  if (rotateInterval) {
    clearInterval(rotateInterval);
  }
});
</script>

<style scoped>
/* Custom animations */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.group:hover .animate-float {
  animation: float 3s ease-in-out infinite;
}

* {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .text-4xl {
    font-size: 2.5rem;
  }
  .text-5xl {
    font-size: 3rem;
  }
  .text-6xl {
    font-size: 3.5rem;
  }
}
</style>