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
          @click="fetchData"
          class="px-6 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <div v-if="saleProgram" class="px-4 py-6 mx-auto max-w-7xl">
      <BreadCrumb :items="breadcrumbItems" class="mb-4" />

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div class="lg:col-span-3">
          <div class="sticky top-4">
            <div
              class="overflow-hidden shadow-lg bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 rounded-2xl"
            >
              <div class="p-6 text-white">
                <div
                  class="inline-block px-4 py-2 mb-4 text-lg font-black text-pink-600 bg-white rounded-full shadow-lg"
                >
                  🔥 {{ saleProgram.benefits?.discountPercentage || 0 }}% OFF
                </div>

                <!-- Timer -->
                <div v-if="timeRemaining" class="mb-4 text-sm font-semibold">
                  ⏰ {{ timeRemaining }}
                </div>

                <!-- Title -->
                <h2 class="mb-3 text-2xl font-black leading-tight">
                  {{ saleProgram.title }}
                </h2>
                <p class="mb-4 text-sm leading-relaxed text-white/90">
                  {{ saleProgram.shortDescription || saleProgram.description }}
                </p>
                <div
                  v-if="saleProgram.bannerImage"
                  class="mb-4 overflow-hidden rounded-lg"
                >
                  <img
                    :src="saleProgram.bannerImage"
                    :alt="saleProgram.title"
                    class="object-cover w-full h-48"
                  />
                </div>

                <div class="space-y-2 text-sm">
                  <div
                    v-if="saleProgram.benefits?.freeShipping"
                    class="flex items-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                      />
                      <path
                        d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"
                      />
                    </svg>
                    <span>Free Shipping</span>
                  </div>

                  <div
                    v-if="saleProgram.conditions?.maxUsagePerUser"
                    class="flex items-center gap-2"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      />
                    </svg>
                    <span
                      >Max {{ saleProgram.conditions.maxUsagePerUser }} per
                      customer</span
                    >
                  </div>

                  <div class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                      />
                    </svg>
                    <span class="font-bold">{{ totalProducts }} Products</span>
                  </div>
                </div>
                <button
                  @click="scrollToProducts"
                  class="w-full px-4 py-3 mt-6 font-bold text-pink-600 transition-colors bg-white rounded-lg hover:bg-gray-100"
                >
                  View All Products →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Content: Products -->
        <div class="lg:col-span-9">
          <div class="p-4 mb-6 bg-white shadow-sm rounded-xl">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <!-- Product Count -->
              <div class="flex items-center gap-2 text-sm">
                <span class="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span class="font-semibold text-gray-800"
                  >{{ filteredProductsCount }} Products</span
                >
              </div>

              <!-- Filters -->
              <div class="flex flex-wrap gap-3">
                <!-- Category Filter -->
                <select
                  v-model="filters.category"
                  @change="applyFilters"
                  class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-[#E6EFFE]"
                >
                  <option value="">All Categories</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>

                <!-- Brand Filter -->
                <select
                  v-model="filters.brand"
                  @change="applyFilters"
                  class="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-[#E6EFFE]"
                >
                  <option value="">All Brands</option>
                  <option v-for="brand in brands" :key="brand" :value="brand">
                    {{ brand }}
                  </option>
                </select>

                <!-- Sort -->
                <select
                  v-model="filters.sort"
                  @change="applyFilters"
                  class="px-4 py-2 text-sm border border-gray-300 shadow-xl rounded-lg focus:ring-2 focus:border-[#E6EFFE]"
                >
                  <option value="featured">⭐ Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A-Z</option>
                  <option value="discount_desc">Biggest Discount</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div
            id="products-section"
            v-if="products.length > 0"
            class="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4"
          >
            <div
              v-for="product in products"
              :key="product._id"
              @click="goToProduct(product)"
              class="overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-xl hover:shadow-lg hover:-translate-y-1 group"
            >
              <!-- Product Image -->
              <div class="relative overflow-hidden bg-gray-100 aspect-square">
                <img
                  :src="product.images?.[0] || '/api/placeholder/300/300'"
                  :alt="product.name"
                  class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />

                <!-- Discount Badge -->
                <div
                  class="absolute px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-full top-2 left-2"
                >
                  In Stock
                </div>

                <div
                  class="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-2 right-2"
                >
                  -{{ saleProgram.benefits?.discountPercentage }}%
                </div>
              </div>

              <!-- Product Info -->
              <div class="p-3 space-y-1.5">
                <!-- Brand -->
                <p class="text-xs tracking-wide text-gray-500 uppercase">
                  {{ product.brand || "Brand" }}
                </p>

                <!-- Name -->
                <h3
                  class="text-sm font-semibold text-gray-900 transition-colors line-clamp-2 group-hover:text-pink-600"
                >
                  {{ product.name }}
                </h3>

                <!-- Rating -->
                <div class="flex items-center gap-1">
                  <div class="flex">
                    <svg
                      v-for="i in 5"
                      :key="i"
                      class="w-3 h-3"
                      :class="
                        i <= Math.round(product.averageRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      "
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  </div>
                  <span class="ml-2 text-xs text-gray-500"
                    >({{ product.ratings?.count || 0 }} Reviews)</span
                  >
                </div>

                <!-- Price -->
                <div class="flex items-baseline gap-2 pt-1">
                  <span class="text-lg font-bold text-pink-600">
                    ${{ calculateSalePrice(product.price) }}
                  </span>
                  <span class="text-xs text-gray-400 line-through">
                    ${{ product.price?.toFixed(2) }}
                  </span>
                </div>

                <!-- Savings -->
                <div
                  class="inline-block px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded"
                >
                  Save ${{
                    (
                      product.price -
                      parseFloat(calculateSalePrice(product.price))
                    ).toFixed(2)
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="py-16 text-center">
            <svg
              class="w-20 h-20 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 00-.707.293l-2.414 2.414A1 1 0 016.586 13H4"
              />
            </svg>
            <h3 class="mb-2 text-xl font-semibold text-gray-700">
              No Products Found
            </h3>
            <p class="mb-4 text-gray-500">Try adjusting your filters</p>
            <button
              @click="resetFilters"
              class="px-6 py-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700"
            >
              Reset Filters
            </button>
          </div>
          <div
            v-if="calculatedTotalPages > 1"
            class="flex items-center justify-center gap-2 mt-8"
          >
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              v-for="page in displayPages"
              :key="page"
              @click="changePage(page)"
              class="px-4 py-2 text-sm font-medium rounded-lg"
              :class="
                page === currentPage
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              "
            >
              {{ page }}
            </button>

            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === calculatedTotalPages"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getSaleProgramByIdApi,
  getProductsBySaleProgramApi,
  calculateTimeRemaining,
} from "../../service/saleProgram.service";
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";
import BreadCrumb from "../../components/commons/BreadCrumb.vue";
import Loading from "../../components/Loading.vue";
const route = useRoute();
const router = useRouter();

// State
const loading = ref(true);
const error = ref(null);
const saleProgram = ref(null);
const allProducts = ref([]);
const totalProducts = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);

const filters = ref({
  category: "",
  brand: "",
  sort: "featured",
  page: 1,
  limit: 12,
});

const breadcrumbItems = computed(() => [
  { label: "Home", to: "/" },
  { label: "Sale Programs", to: "/sale-programs" },
  { label: saleProgram.value?.title || "Loading...", to: "" },
]);

const categories = computed(() => {
  const cats = new Set();
  allProducts.value.forEach((p) => {
    if (p.category?.name) cats.add(p.category.name);
  });
  return Array.from(cats).sort();
});

const brands = computed(() => {
  const brandSet = new Set();
  allProducts.value.forEach((p) => {
    if (p.brand) brandSet.add(p.brand);
  });
  return Array.from(brandSet).sort();
});

const filteredProducts = computed(() => {
  let result = [...allProducts.value];

  if (filters.value.category) {
    result = result.filter((p) => p.category?.name === filters.value.category);
  }
  if (filters.value.brand) {
    result = result.filter(
      (p) => p.brand?.toLowerCase() === filters.value.brand.toLowerCase()
    );
  }

  switch (filters.value.sort) {
    case "price_asc":
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case "price_desc":
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "name_asc":
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "discount_desc":
      result.sort((a, b) => {
        const discountA = saleProgram.value?.benefits?.discountPercentage || 0;
        const discountB = saleProgram.value?.benefits?.discountPercentage || 0;
        return discountB - discountA;
      });
      break;
    case "featured":
    default:
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      break;
  }

  return result
})

// Paginated products
const products = computed(() => {
  const start = (currentPage.value - 1) * filters.value.limit;
  const end = start + filters.value.limit;
  return filteredProducts.value.slice(start, end);
});

const filteredProductsCount = computed(() => filteredProducts.value.length);

const calculatedTotalPages = computed(() => {
  return Math.ceil(filteredProductsCount.value / filters.value.limit);
});

const timeRemaining = computed(() => {
  if (!saleProgram.value?.endDate) return null;
  return calculateTimeRemaining(saleProgram.value.endDate);
});

const displayPages = computed(() => {
  const pages = [];
  const maxDisplay = 5;
  const total = calculatedTotalPages.value;
  let start = Math.max(1, currentPage.value - Math.floor(maxDisplay / 2));
  let end = Math.min(total, start + maxDisplay - 1);

  if (end - start < maxDisplay - 1) {
    start = Math.max(1, end - maxDisplay + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;

    const saleProgramId = route.params.id;

    const [programRes, productsRes] = await Promise.all([
      getSaleProgramByIdApi(saleProgramId),
      getProductsBySaleProgramApi(saleProgramId, {
        page: filters.value.page,
        limit: filters.value.limit,
        sortBy: filters.value.sort,
        sortOrder: filters.value.sort.includes("desc") ? "desc" : "asc",
      }),
    ]);

    if (programRes?.data?.success) {
      saleProgram.value = programRes.data.saleProgram;
    } else if (programRes?.data?.saleProgram) {
      saleProgram.value = programRes.data.saleProgram;
    } else {
      throw new Error("Invalid sale program data");
    }

    if (productsRes?.data?.success) {
      allProducts.value = productsRes.data.products || [];
      totalProducts.value =
        productsRes.data.pagination?.totalProducts || allProducts.value.length;
    } else {
      allProducts.value = [];
      totalProducts.value = 0;
    }
    currentPage.value = 1;
  } catch (err) {
    console.error("Error:", err);
    error.value = err.response?.data?.message || "Failed to load sale program";
  } finally {
    loading.value = false;
  }
};

const calculateSalePrice = (originalPrice) => {
  if (!originalPrice || !saleProgram.value?.benefits?.discountPercentage) {
    return originalPrice?.toFixed(2) || "0.00";
  }
  const discount = saleProgram.value.benefits.discountPercentage;
  const salePrice = originalPrice * (1 - discount / 100);
  return salePrice.toFixed(2);
};

const applyFilters = () => {
  currentPage.value = 1;
  filters.value.page = 1;
};
const resetFilters = () => {
  filters.value = {
    category: "",
    brand: "",
    sort: "featured",
    page: 1,
    limit: 12,
  };
  currentPage.value = 1;
};

const changePage = (page) => {
  if (page < 1 || page > calculatedTotalPages.value) return;
  currentPage.value = page;
  filters.value.page = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const goToProduct = (product) => {
  router.push(`/products/${product.slug || product._id}`);
};

const scrollToProducts = () => {
  document
    .getElementById("products-section")
    ?.scrollIntoView({ behavior: "smooth" });
};

onMounted(() => {
  fetchData();
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      resetFilters();
      fetchData();
    }
  }
);
</script>