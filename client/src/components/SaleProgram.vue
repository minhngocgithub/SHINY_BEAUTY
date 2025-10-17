<template>
  <section class="relative px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div v-if="loading" class="flex items-center justify-center"> 
      <Loading /> 
    </div>
    <div v-else-if="error" class="py-12 text-center">
      <svg
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="mb-4 text-gray-600">{{ error }}</p>
      <button
        @click="fetchSalePrograms"
        class="px-6 py-2 text-white transition-colors duration-200 rounded-lg bg-rose-500 hover:bg-rose-600"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="salePrograms.length > 0" class="relative">
      <div class="overflow-hidden">
        <div
          class="grid grid-cols-1 gap-6 transition-all duration-500 ease-in-out md:grid-cols-2 lg:grid-cols-3"
          :style="{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }"
        >
          <div
            v-for="(program, index) in salePrograms"
            :key="program.id"
            class="relative overflow-hidden transition-all duration-300 transform bg-white shadow-lg cursor-pointer group rounded-2xl hover:shadow-xl hover:-translate-y-2"
            :data-aos="index < 3 ? 'fade-up' : ''"
            :data-aos-delay="index < 3 ? index * 100 : 0"
            :data-aos-duration="600"
            @click="goToSaleProducts(program.id)"
          >
            <div
              class="relative overflow-hidden h-72 sm:h-80 md:h-96 rounded-t-2xl"
            >
              <img
                :src="program.bannerImage || '/placeholder-sale.jpg'"
                :alt="program.title"
                class="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div
                class="absolute inset-0 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80"
              ></div>
              <div
                class="absolute flex items-center gap-2 px-4 py-2 text-white rounded-full shadow-lg top-4 right-4 bg-rose-500"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="text-sm font-bold"
                  >{{ program.discountPercentage }}% OFF</span
                >
              </div>
              <div
                v-if="program.timeRemaining"
                class="absolute flex items-center gap-2 px-3 py-1.5 text-white bg-black/60 backdrop-blur-sm bottom-4 left-4 rounded-full"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-xs font-medium">{{
                  program.timeRemaining
                }}</span>
              </div>
            </div>
            <div
              class="p-6 transition-colors duration-300 bg-gradient-to-br from-rose-50 to-pink-50 rounded-b-2xl group-hover:from-rose-100 group-hover:to-pink-100"
            >
              <h3
                class="mb-3 text-lg font-bold leading-tight text-gray-900 transition-colors duration-200 line-clamp-2 group-hover:text-rose-600"
              >
                {{ program.title }}
              </h3>

              <p class="mb-4 text-sm text-gray-600 line-clamp-2">
                {{ program.shortDescription }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-rose-600">
                  Shop Now
                </span>
                <svg
                  class="w-5 h-5 transition-transform duration-300 text-rose-600 group-hover:translate-x-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        v-if="salePrograms.length > visibleItems"
        @click="prevSlide"
        :disabled="currentIndex === 0"
        class="absolute z-10 flex items-center justify-center w-12 h-12 transition-all duration-300 -translate-y-1/2 bg-white rounded-full shadow-lg left-2 md:left-4 top-1/2 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-50 group"
        :class="{ 'hover:scale-110': currentIndex > 0 }"
        aria-label="Previous"
      >
        <svg
          class="w-6 h-6 text-gray-700 transition-colors duration-200 group-hover:text-rose-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="salePrograms.length > visibleItems"
        @click="nextSlide"
        :disabled="currentIndex >= salePrograms.length - visibleItems"
        class="absolute z-10 flex items-center justify-center w-12 h-12 transition-all duration-300 -translate-y-1/2 bg-white rounded-full shadow-lg right-2 md:right-4 top-1/2 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-50 group"
        :class="{
          'hover:scale-110': currentIndex < salePrograms.length - visibleItems,
        }"
        aria-label="Next"
      >
        <svg
          class="w-6 h-6 text-gray-700 transition-colors duration-200 group-hover:text-rose-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <div
        v-if="salePrograms.length > visibleItems"
        class="flex justify-center gap-2 mt-8"
      >
        <button
          v-for="(dot, index) in Math.ceil(salePrograms.length / visibleItems)"
          :key="index"
          @click="goToSlide(index)"
          class="transition-all duration-300 rounded-full"
          :class="
            currentSlideIndex === index
              ? 'bg-rose-500 w-8 h-2'
              : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'
          "
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
    </div>
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
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      <p class="text-lg text-gray-500">No active sale programs at the moment</p>
      <p class="mt-2 text-sm text-gray-400">
        Check back soon for amazing deals!
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import {
  getActiveSaleProgramsApi,
  formatSaleProgramForDisplay,
  calculateTimeRemaining,
} from "../service/saleProgram.service"
import Loading from '../components/Loading.vue'
    const router = useRouter()
    const salePrograms = ref([])
    const loading = ref(true)
    const error = ref(null)
    const currentIndex = ref(0)
    const windowWidth = ref(window.innerWidth)
    const visibleItems = computed(() => {
      if (windowWidth.value < 768) return 1
      if (windowWidth.value < 1024) return 2
      return 3
    });
    const currentSlideIndex = computed(() => {
      return Math.floor(currentIndex.value / visibleItems.value);
    });
    const fetchSalePrograms = async () => {
      try {
        loading.value = true;
        error.value = null;

        const response = await getActiveSaleProgramsApi({
          limit: 10,
        });

        if (response.data.success) {
          salePrograms.value = response.data.salePrograms.map((program) => {
            // Format and add time remaining
            const formatted = formatSaleProgramForDisplay(program);
            formatted.timeRemaining = calculateTimeRemaining(program.endDate);
            return formatted;
          });
        }
      } catch (err) {
        console.error("Error fetching sale programs:", err);
        error.value = "Unable to load sale programs. Please try again.";
      } finally {
        loading.value = false;
      }
    };

    // Navigation methods
    const nextSlide = () => {
      if (currentIndex.value < salePrograms.value.length - visibleItems.value) {
        currentIndex.value += visibleItems.value;
      }
    };

    const prevSlide = () => {
      if (currentIndex.value > 0) {
        currentIndex.value -= visibleItems.value;
      }
    };

    const goToSlide = (slideIndex) => {
      currentIndex.value = slideIndex * visibleItems.value;
    };
    const goToSaleProducts = (programId) => {
      router.push({
        name: "SaleProgramProducts",
        params: { id: programId },
      });
    };
    const updateWindowWidth = () => {
      windowWidth.value = window.innerWidth;
      const maxIndex = Math.max(
        0,
        salePrograms.value.length - visibleItems.value
      );
      if (currentIndex.value > maxIndex) {
        currentIndex.value = maxIndex;
      }
    };

    onMounted(() => {
      fetchSalePrograms();
      window.addEventListener("resize", updateWindowWidth);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateWindowWidth);
    });

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions for slider */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optimize for performance */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Loading skeleton animation */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>