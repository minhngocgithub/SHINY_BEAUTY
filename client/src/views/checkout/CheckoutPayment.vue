<template>
  <div class="min-h-screen bg-gray-50">

    <div class="px-4 py-6 mx-auto max-w-7xl">
      <!-- Breadcrumb -->
      <div class="mb-4 text-sm breadcrumb">
        <router-link to="/" class="text-blue-600 hover:underline">Home</router-link>
        <span class="mx-2 text-gray-400">/</span>
        <router-link to="/wishlist" class="text-blue-600 hover:underline">Wishlist</router-link>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-600">Checkout</span>
      </div>

      <h1 class="mb-6 text-3xl font-bold">Checkout</h1>

      <!-- Error Alert -->
      <div v-if="error" class="p-4 mb-6 text-red-800 border border-red-200 rounded-lg bg-red-50">
        {{ error }}
      </div>

      <!-- Success Alert -->
      <div v-if="success" class="p-4 mb-6 text-green-800 border border-green-200 rounded-lg bg-green-50">
        {{ success }}
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left: Checkout Form -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Shipping Address Section -->
          <div class="p-6 bg-white rounded-lg shadow-sm">
            <h2 class="mb-4 text-xl font-bold">Shipping Address</h2>

            <div class="space-y-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <!-- Full Name -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    v-model="shippingAddress.name"
                    type="text"
                    placeholder="John Doe"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
                </div>

                <!-- Phone -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    v-model="shippingAddress.phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Email *</label>
                <input
                  v-model="shippingAddress.email"
                  type="email"
                  placeholder="john@example.com"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
              </div>

              <!-- Address -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Street Address *</label>
                <input
                  v-model="shippingAddress.address"
                  type="text"
                  placeholder="123 Main Street"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p v-if="errors.address" class="mt-1 text-xs text-red-600">{{ errors.address }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <!-- City -->
                <div class="md:col-span-2">
                  <label class="block mb-2 text-sm font-medium text-gray-700">City *</label>
                  <input
                    v-model="shippingAddress.city"
                    type="text"
                    placeholder="New York"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p v-if="errors.city" class="mt-1 text-xs text-red-600">{{ errors.city }}</p>
                </div>

                <!-- State -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">State *</label>
                  <input
                    v-model="shippingAddress.state"
                    type="text"
                    placeholder="NY"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p v-if="errors.state" class="mt-1 text-xs text-red-600">{{ errors.state }}</p>
                </div>

                <!-- Zip Code -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">Zip Code *</label>
                  <input
                    v-model="shippingAddress.zipCode"
                    type="text"
                    placeholder="10001"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p v-if="errors.zipCode" class="mt-1 text-xs text-red-600">{{ errors.zipCode }}</p>
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">Order Notes (Optional)</label>
                <textarea
                  v-model="shippingAddress.notes"
                  placeholder="Add any special instructions..."
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Payment Method Section -->
          <div class="p-6 bg-white rounded-lg shadow-sm">
            <h2 class="mb-4 text-xl font-bold">Payment Method</h2>

            <div class="space-y-3">
              <label
                v-for="method in paymentMethods"
                :key="method.id"
                class="flex items-center p-4 transition border-2 rounded-lg cursor-pointer"
                :class="selectedPaymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <input
                  type="radio"
                  :value="method.id"
                  v-model="selectedPaymentMethod"
                  class="w-4 h-4 text-blue-600"
                />
                <div class="flex-1 ml-4">
                  <p class="font-semibold text-gray-900">{{ method.label }}</p>
                  <p class="text-sm text-gray-600">{{ method.description }}</p>
                </div>
                <span class="text-2xl">{{ method.icon }}</span>
              </label>
            </div>

            <!-- Stripe Card Input (if Stripe selected) -->
            <div v-if="selectedPaymentMethod === 'stripe'" class="p-4 mt-4 rounded-lg bg-gray-50">
              <p class="mb-3 text-sm text-gray-600">Card information will be securely processed by Stripe</p>
              <div id="card-element" class="p-4 bg-white border border-gray-300 rounded"></div>
              <p v-if="cardError" class="mt-2 text-xs text-red-600">{{ cardError }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary -->
        <div class="lg:col-span-1">
          <div class="sticky overflow-hidden shadow-lg top-4 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl">
            <div class="p-6 text-white">
              <h3 class="mb-4 text-xl font-bold">Order Summary</h3>

              <!-- Items List -->
              <div class="mb-4 space-y-2 overflow-y-auto max-h-64">
                <div
                  v-for="item in checkoutItems"
                  :key="item._id"
                  class="flex items-center justify-between p-2 text-sm rounded bg-white/20"
                >
                  <div class="flex-1">
                    <p class="line-clamp-1">{{ item.product?.name }}</p>
                    <p class="text-xs text-white/80">${{ (item.product?.salePrice || item.product?.price).toFixed(2) }}</p>
                  </div>
                  <button
                    @click="removeItem(item._id)"
                    class="ml-2 text-red-300 hover:text-red-100"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Price Breakdown -->
              <div class="pt-4 mb-6 space-y-2 border-t border-white/30">
                <div class="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${{ shippingCost.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${{ tax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between pt-2 text-lg font-bold border-t border-white/30">
                  <span>Total</span>
                  <span>${{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Place Order Button -->
              <button
                @click="placeOrder"
                :disabled="isProcessing || checkoutItems.length === 0"
                class="w-full px-4 py-3 font-bold text-blue-600 transition-colors bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}` }}
              </button>

              <!-- Security Info -->
              <div class="mt-4 text-xs text-center text-white/80">
                Secure checkout powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import {
  createOrderWithPaymentApi,
  validateShippingAddress,
  validatePaymentMethod,
  validateCheckoutItems,
  buildOrderPayload,
  calculateOrderPricing,
  handlePaymentRedirect,
  formatOrderResponse,
  getPaymentErrorMessage,
  PAYMENT_METHODS,
  getPaymentMethodLabel,
  getPaymentMethodDescription
} from '../../service/payment.service'

const router = useRouter()

// State
const checkoutItems = ref([])
const shippingAddress = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  notes: ''
})

const selectedPaymentMethod = ref(PAYMENT_METHODS.COD)
const isProcessing = ref(false)
const error = ref(null)
const success = ref(null)
const errors = ref({})
const cardError = ref(null)
const shippingCost = ref(9.99)

const paymentMethods = [
  {
    id: PAYMENT_METHODS.STRIPE,
    label: 'Credit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳'
  },
  {
    id: PAYMENT_METHODS.MOMO,
    label: 'MoMo Wallet',
    description: 'Vietnam Mobile Money',
    icon: '📱'
  },
  {
    id: PAYMENT_METHODS.ZALOPAY,
    label: 'ZaloPay',
    description: 'Vietnam E-Wallet',
    icon: '📱'
  },
  {
    id: PAYMENT_METHODS.COD,
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: '💵'
  }
]

// Load checkout items on mount
onMounted(() => {
  const items = sessionStorage.getItem('checkoutItems')
  if (items) {
    try {
      checkoutItems.value = JSON.parse(items)
    } catch (err) {
      error.value = 'Failed to load checkout items'
    }
  } else {
    error.value = 'No items in checkout. Redirecting...'
    setTimeout(() => router.push('/wishlist'), 2000)
  }
})

// Computed
const subtotal = computed(() => {
  return checkoutItems.value.reduce((sum, item) => {
    const price = item.product?.salePrice || item.product?.price || 0
    return sum + price
  }, 0)
})

const tax = computed(() => {
  return subtotal.value * 0.1
})

const totalAmount = computed(() => {
  return subtotal.value + shippingCost.value + tax.value
})

// Methods
const removeItem = (itemId) => {
  checkoutItems.value = checkoutItems.value.filter(item => item._id !== itemId)
}

const validateForm = () => {
  errors.value = {}
  const validation = validateShippingAddress(shippingAddress.value)

  if (!validation.valid) {
    validation.errors.forEach(err => {
      const field = err.split(' ')[0].toLowerCase()
      errors.value[field] = err
    })
    return false
  }

  if (!selectedPaymentMethod.value) {
    error.value = 'Please select a payment method'
    return false
  }

  return true
}

const placeOrder = async () => {
  try {
    error.value = null
    success.value = null

    if (!validateForm()) {
      return
    }

    isProcessing.value = true

    // Create order payload
    const orderPayload = createOrderPayload(
      checkoutItems.value,
      shippingAddress.value,
      selectedPaymentMethod.value
    )

    // Call payment API
    const response = await createOrderWithPaymentApi(orderPayload)

    if (response.data.success) {
      success.value = 'Order created successfully!'
      
      // Redirect based on payment method
      if (selectedPaymentMethod.value === 'cod') {
        setTimeout(() => {
          router.push(`/orders/${response.data.orderId}`)
        }, 2000)
      } else if (response.data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = response.data.paymentUrl
      } else {
        setTimeout(() => {
          router.push(`/orders/${response.data.orderId}`)
        }, 2000)
      }

      // Clear checkout items
      sessionStorage.removeItem('checkoutItems')
    } else {
      error.value = response.data.message || 'Failed to create order'
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'An error occurred'
    console.error('Order error:', err)
  } finally {
    isProcessing.value = false
  }
}
</script>