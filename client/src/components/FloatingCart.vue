<template>
  <div>
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
          <Transition name="badge-bounce">
            <div
              v-if="cartStore.cartCount > 0"
              class="absolute flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 border-2 border-white rounded-full shadow-md -top-2 -right-2 md:w-6 md:h-6"
            >
              {{ cartStore.cartCount > 99 ? '99+' : cartStore.cartCount }}
            </div>
          </Transition>
        </div>
        <div 
          class="absolute inset-0 rounded-full bg-white/20 opacity-20"
          :class="{ 'animate-ping': cartStore.cartCount > 0 }"
        ></div>

        <!-- Tooltip -->
        <div class="absolute px-3 py-1 text-xs font-medium text-white transition-opacity bg-gray-900 rounded-lg opacity-0 pointer-events-none -top-10 whitespace-nowrap group-hover:opacity-100">
          View Cart
          <div class="absolute w-2 h-2 transform rotate-45 -translate-x-1/2 bg-gray-900 left-1/2 -bottom-1"></div>
        </div>
      </div>
    </Transition>

    <!-- Cart Drawer/Modal -->
    <Transition name="drawer">
      <div
        v-if="isCartOpen"
        class="fixed inset-0 z-50 overflow-hidden"
        @click="closeCart"
      >
        <div class="absolute inset-0 transition-opacity bg-black/50 backdrop-blur-sm"></div>
        
        <div
          class="absolute inset-y-0 right-0 flex max-w-full"
          @click.stop
        >
          <div class="w-screen max-w-md">
            <div class="flex flex-col h-full bg-white shadow-xl">
              <!-- Header -->
              <div class="px-4 py-6 bg-gradient-to-r from-rose-500 to-pink-600 sm:px-6">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-white">
                    Shopping Cart ({{ cartStore.cartCount }})
                  </h2>
                  <button
                    @click="closeCart"
                    class="text-white transition hover:text-gray-200"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Cart Items -->
              <div class="flex-1 px-4 py-6 overflow-y-auto sm:px-6">
                <div v-if="cartStore.loading" class="flex items-center justify-center h-full">
                  <div class="w-8 h-8 border-4 border-gray-300 rounded-full border-t-rose-600 animate-spin"></div>
                </div>

                <div v-else-if="cartStore.isEmpty" class="flex flex-col items-center justify-center h-full text-center">
                  <svg class="w-24 h-24 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <h3 class="mb-2 text-lg font-semibold text-gray-900">Your cart is empty</h3>
                  <p class="mb-4 text-sm text-gray-500">Add some products to get started!</p>
                  <button
                    @click="closeCart"
                    class="px-6 py-2 text-white transition rounded-lg bg-rose-600 hover:bg-rose-700"
                  >
                    Continue Shopping
                  </button>
                </div>

                <div v-else class="space-y-4">
                  <div
                    v-for="item in cartStore.cartItems"
                    :key="item._id"
                    class="flex gap-4 p-4 transition border border-gray-200 rounded-lg hover:shadow-md"
                  >
                    <img
                      :src="item.product?.image?.url || item.product?.image"
                      :alt="item.product?.name"
                      class="object-cover w-20 h-20 rounded-lg"
                    />
                    <div class="flex-1">
                      <h3 class="mb-1 text-sm font-semibold text-gray-900">{{ item.product?.name }}</h3>
                      <p class="mb-2 text-xs text-gray-500">{{ item.product?.brand }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-rose-600">
                          ${{ (item.product?.salePrice || item.product?.price)?.toFixed(2) }}
                        </span>
                        <div class="flex items-center gap-2">
                          <button
                            @click="decreaseQuantity(item)"
                            class="p-1 transition rounded hover:bg-gray-100"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                            </svg>
                          </button>
                          <span class="w-8 text-sm text-center">{{ item.quantity }}</span>
                          <button
                            @click="increaseQuantity(item)"
                            class="p-1 transition rounded hover:bg-gray-100"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      @click="removeItem(item._id)"
                      class="text-gray-400 transition hover:text-red-600"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div v-if="!cartStore.isEmpty" class="px-4 py-6 border-t border-gray-200 sm:px-6">
                <div class="mb-4 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-semibold">${{ cartStore.cartTotals.subtotal }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Shipping</span>
                    <span class="font-semibold">
                      {{ cartStore.cartTotals.shipping === 0 ? 'FREE' : `${cartStore.cartTotals.shipping}` }}
                    </span>
                  </div>
                  <div class="flex justify-between pt-2 text-base font-semibold border-t">
                    <span>Total</span>
                    <span class="text-rose-600">${{ cartStore.cartTotals.total }}</span>
                  </div>
                </div>

                <button
                  @click="goToCheckout"
                  class="w-full px-6 py-3 font-semibold text-white transition rounded-lg bg-rose-600 hover:bg-rose-700"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  @click="closeCart"
                  class="w-full px-6 py-2 mt-2 font-medium text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { useCartStore } from '../store/cart.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const isCartOpen = ref(false)

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}

const closeCart = () => {
  isCartOpen.value = false
}

const increaseQuantity = async (item) => {
  try {
    await cartStore.updateQuantity(item._id, item.quantity + 1)
  } catch (error) {
    console.error('Failed to update quantity:', error)
  }
}

const decreaseQuantity = async (item) => {
  if (item.quantity > 1) {
    try {
      await cartStore.updateQuantity(item._id, item.quantity - 1)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }
}

const removeItem = async (itemId) => {
  try {
    await cartStore.removeItem(itemId)
  } catch (error) {
    console.error('Failed to remove item:', error)
  }
}

const goToCheckout = () => {
  closeCart()
  router.push('/checkout')
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    cartStore.fetchCart()
  }
})
</script>

<style scoped>
/* Cart fade animations */
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

/* Badge bounce animation */
.badge-bounce-enter-active {
  animation: bounce 0.5s;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

/* Drawer animations */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease-in-out;
}

.drawer-enter-from .absolute.inset-0,
.drawer-leave-to .absolute.inset-0 {
  opacity: 0;
}

.drawer-enter-from .absolute.inset-y-0,
.drawer-leave-to .absolute.inset-y-0 {
  transform: translateX(100%);
}
</style>
