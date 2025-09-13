<template>
  <section class="relative w-full min-h-screen bg-gradient-to-b from-rose-50 to-white">
    <Header />
    <div class="pt-4 pb-8">
      <Slider />
    </div>
    <div class="pb-12">
      <FlashSaleProduct />
    </div>

    <FloatingCart @toggle-cart="handleToggleCart" />
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Slider from '../components/Slider.vue'
import FlashSaleProduct from '../components/FlashSaleProduct.vue'
import FloatingCart from '../components/FloatingCart.vue'
import { useAuthStore } from '../store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

// Handle cart toggle event
const handleToggleCart = () => {
  // Bạn có thể chuyển hướng đến trang cart
  router.push('/cart')

}

onMounted(() => {

  authStore.loadFromStorage()
})
</script>

<style scoped>
section {
  transition: all 0.3s ease-in-out;
}

/* Đảm bảo floating cart không bị che bởi các element khác */
.relative {
  position: relative;
}
</style>