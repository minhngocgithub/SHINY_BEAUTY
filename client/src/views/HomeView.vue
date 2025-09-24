<template>
  <section class="relative w-full min-h-screen bg-gradient-to-b from-rose-50 to-white">
    <Header />
    
    <div 
      class="pt-4 pb-8"
      data-aos="fade-down"
      data-aos-duration="1000"
    >
      <Slider />
    </div>
    
    <div 
      class="pb-12"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="200"
    >
      <BestSeller />
    </div>
    
    <!-- New Product Showcase Section -->
    <div class="pb-12">
      <FeaturedProduct 
        section-title="Featured Collection"
        brand-name="Luxury"
        collection-name="Premium collection"
        :description="showcaseDescription"
      />
    </div>
    
    <!-- Additional sections can be added here with AOS -->
    <div 
      class="pb-12"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="400"
    >
      <!-- Future: BestSellers, NewArrivals, etc. -->
    </div>
     
    <FloatingCart @toggle-cart="handleToggleCart" />
  </section>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Slider from '../components/Slider.vue'
import BestSeller from '../components/BestSeller.vue'
import FeaturedProduct from '../components/Featured.vue'
import FloatingCart from '../components/FloatingCart.vue'
import { useAuthStore } from '../store/auth.store'
import { refreshAOS } from '../../utils/aos'

const router = useRouter()
const authStore = useAuthStore()

// Showcase description
const showcaseDescription = ref(
  'Discover our premium cosmetic collection, carefully curated to enhance your natural beauty with innovative formulations and luxurious textures that deliver exceptional results.'
)

// Handle cart toggle event
const handleToggleCart = () => {
  router.push('/cart')
}

onMounted(async () => {
  // Load auth state
  authStore.loadFromStorage()
  
  // Wait for DOM updates
  await nextTick()
  
  // Refresh AOS after all components loaded
  setTimeout(() => {
    refreshAOS()
  }, 100)
  
  // SEO: Add structured data
  addStructuredData()
})

// SEO: Add JSON-LD structured data
const addStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Luxury Cosmetics - Premium Beauty Products",
    "description": "Discover premium cosmetic collections with innovative formulations and luxurious textures. Shop featured products, flash sales, and new arrivals.",
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Featured Products",
      "description": "Our curated selection of premium cosmetic products"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      }]
    }
  }
  
  // Add to head
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(structuredData)
  document.head.appendChild(script)
}
</script>

<style scoped>
section {
  transition: all 0.3s ease-in-out;
}

.relative {
  position: relative;
}
</style>