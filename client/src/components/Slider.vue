<template>
    <!-- Slide 1 --> 
    <div class="relative w-full px-4 py-4 mx-auto max-w-7xl">
        <!-- Main slider container -->
        <div class="grid grid-cols-1 gap-6 transition-all duration-500 ease-in-out md:grid-cols-2 lg:grid-cols-3">
            <div 
                class="relative overflow-hidden transition-all duration-300 transform shadow-lg group rounded-2xl hover:shadow-xl hover:-translate-y-1" 
                v-for="(content, index) in contents.slice(currentIndex, currentIndex + getVisibleItems)" 
                :key="index"
            >
                <!-- Image container -->
                <div class="relative overflow-hidden rounded-t-2xl">
                    <img 
                        :src="content.image" 
                        :alt="content.title" 
                        class="object-cover w-full h-48 transition-transform duration-300 md:h-56 group-hover:scale-105"
                    >
                    <!-- Gradient overlay -->
                    <div class="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100"></div>
                </div>
                
                <!-- Content section -->
                <div class="p-6 bg-gradient-to-r from-rose-100 to-pink-50 rounded-b-2xl">
                    <h3 class="mb-4 text-sm font-semibold leading-relaxed text-gray-800 md:text-base line-clamp-2">
                        {{ content.title }}
                    </h3>
                    <router-link 
                        :to="content.router" 
                        class="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 text-rose-600 hover:text-rose-700 group/link"
                    >
                        Shop Now
                        <svg class="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                        </svg>
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Previous button -->
        <button 
            @click="prevContent"
            :disabled="currentIndex === 0"
            class="absolute z-10 w-12 h-12 transition-all duration-300 -translate-y-1/2 rounded-full shadow-lg left-2 md:left-4 top-1/2 bg-white/90 backdrop-blur-sm hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white group"
            :class="{ 'hover:scale-110': currentIndex > 0 }"
        >
            <svg class="w-5 h-5 mx-auto text-gray-600 transition-colors duration-200 group-hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
        </button>

        <!-- Next button -->
        <button 
            @click="nextContent"
            :disabled="currentIndex >= contents.length - getVisibleItems"
            class="absolute z-10 w-12 h-12 transition-all duration-300 -translate-y-1/2 rounded-full shadow-lg right-2 md:right-4 top-1/2 bg-white/90 backdrop-blur-sm hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white group"
            :class="{ 'hover:scale-110': currentIndex < contents.length - getVisibleItems }"
        >
            <svg class="w-5 h-5 mx-auto text-gray-600 transition-colors duration-200 group-hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
        </button>

        <!-- Added pagination dots for better UX -->
        <div class="flex justify-center gap-2 mt-6">
            <button
                v-for="(dot, index) in Math.ceil(contents.length / getVisibleItems)"
                :key="index"
                @click="goToSlide(index)"
                class="w-2 h-2 transition-all duration-300 rounded-full"
                :class="Math.floor(currentIndex / getVisibleItems) === index 
                    ? 'bg-rose-500 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'"
            ></button>
        </div>
    </div>    
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
    name: 'CosmeticSlider',
    setup() {
        const contents = ref([
            { image: 'src/assets/image/slider/slider_01.png', title: "K18 AirWash Dry Shampoo", router: '/' },
            { image:"src/assets/image/slider/slider_02.png", title: "New! New Clinically proven to reduce oil and elimate odor for up to this day", router: "/" },
            { image:"src/assets/image/slider/slider_03.png", title: "Concealers for Blemishes & Redness", router: "/" },
            { image: "src/assets/image/slider/slider_04.png", title: "Big In Beauty", router: "/"},
            { image: "src/assets/image/slider/slider_05.png", title: "Complexition ShorCut", router: "/"},
            { image: "src/assets/image/slider/slider_06.png", title: "This Just In", router: "/"},
        ])
        const currentIndex = ref(0)
        const windowWidth = ref(window.innerWidth)
        
        const getVisibleItems = computed(() => {
            if (windowWidth.value < 768) return 1 // mobile
            if (windowWidth.value < 1024) return 2 // tablet
            return 3 // desktop
        })

        const updateWindowWidth = () => {
            windowWidth.value = window.innerWidth
        }
        const fetchFeaturedProducts = () => {
            
        }
        onMounted(() => {
            window.addEventListener('resize', updateWindowWidth)
        })

        onUnmounted(() => {
            window.removeEventListener('resize', updateWindowWidth)
        })

        const nextContent = () => {
            const visibleItems = getVisibleItems.value
            if (currentIndex.value < contents.value.length - visibleItems) {
                currentIndex.value += visibleItems
            }
        }

        const prevContent = () => {
            const visibleItems = getVisibleItems.value
            if (currentIndex.value > 0) {
                currentIndex.value -= visibleItems
            }
        }

        const goToSlide = (slideIndex) => {
            currentIndex.value = slideIndex * getVisibleItems.value
        }

        return {
            contents, 
            currentIndex, 
            nextContent, 
            prevContent,
            getVisibleItems,
            goToSlide
        }
    }
}
</script>

<style scoped>

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
