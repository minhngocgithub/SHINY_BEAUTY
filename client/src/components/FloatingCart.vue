<template>
  <Transition name="cart-fade" appear>
    <div 
      v-if="authStore.isLoggedIn"
      class="fixed z-50 flex items-center justify-center transition-all duration-300 transform border-2 rounded-full shadow-lg cursor-pointer bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-rose-400 to-pink-600 hover:shadow-xl hover:scale-105 hover:-translate-y-1 active:scale-95 border-white/20 backdrop-blur-sm group"
      @click="toggleCart"
    >
      <!-- Cart Icon -->
      <div class="relative">
        <svg 
          class="w-6 h-6 text-white transition-transform duration-300 md:w-7 md:h-7 group-hover:scale-110" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
          />
        </svg>
        
        <!-- Cart Count Badge -->
        <div 
          v-if="cartCount > 0" 
          class="absolute flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 border-2 border-white rounded-full shadow-md -top-2 -right-2 md:w-6 md:h-6 animate-pulse"
        >
          {{ cartCount > 99 ? '99+' : cartCount }}
        </div>
      </div>
      
      <!-- Ripple Effect -->
      <div class="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20"></div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore().state
const router = useRouter()


const cartCount = ref(3) // Nên lấy từ cart store

const toggleCart = () => {
  // Thêm logic toggle cart ở đây
  console.log('Toggle cart')
  
}
</script>

<style scoped>
/* Custom animations for transitions */
.cart-fade-enter-active,
.cart-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-fade-enter-from {
  opacity: 0;
  transform: translateY(1.25rem) scale(0.8);
}

.cart-fade-leave-to {
  opacity: 0;
  transform: translateY(-1.25rem) scale(0.8);
}

/* Custom ripple animation */
@keyframes custom-ping {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-custom-ping {
  animation: custom-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>