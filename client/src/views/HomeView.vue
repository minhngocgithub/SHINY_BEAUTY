<template>
  <section class="relative w-full min-h-screen bg-gradient-to-b from-rose-50 to-white">
    <Header />
    
    <div 
      class="pt-4 pb-8"
      data-aos="fade-down"
      data-aos-duration="1000"
    >
      <SaleProgram />
    </div>
    <section 
      class="pb-12"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="200"
    >
      <BestSeller />
    </section>
    
    <!-- New Product Showcase Section -->
    <section class="pb-6">
      <FeaturedProduct 
        section-title="Featured Collection"
        brand-name="Luxury"
        collection-name="Premium collection"
        :description="showcaseDescription"
      />
    </section>
    
    <section 
      class=""
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="400"
    >
      <QuickLink />
    </section>
    <!-- Additional sections can be added here with AOS -->
    <section 
      class="px-16"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="400"
    >
      <NewArrivals />
    </section>
    <FloatingCart @toggle-cart="handleToggleCart" />
  </section>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import SaleProgram from '../components/SaleProgram.vue'
import BestSeller from '../components/BestSeller.vue'
import FeaturedProduct from '../components/Featured.vue'
import FloatingCart from '../components/FloatingCart.vue'
import NewArrivals from '../components/NewArrival.vue'
import QuickLink from '../components/QuickLink.vue'
import Footer from '../components/Footer.vue'
import { useAuthStore } from '../store/auth.store'
import { refreshAOS } from '../../utils/aos'

const router = useRouter()
const authStore = useAuthStore()

// Showcase description
const showcaseDescription = ref(
  'Discover our premium cosmetic collection, carefully curated to enhance your natural beauty with innovative formulations and luxurious textures that deliver exceptional results.'
)
const handleToggleCart = () => {
  router.push('/cart')
}

onMounted(async () => {
  authStore.loadFromStorage()

  await nextTick()
  setTimeout(() => {
    refreshAOS()
  }, 100)

  addStructuredData()
})

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