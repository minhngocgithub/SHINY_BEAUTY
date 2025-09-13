<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 capitalize bg-black bg-opacity-50 flex items-center justify-center z-[9999]" @click="closeModal">
      <div class="bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex flex-col lg:flex-row">
          <div class="p-6 lg:w-1/2">
            <div class="mb-4 overflow-hidden rounded-lg bg-gray-50 aspect-square">
              <img 
                :src="currentImage || product.imageUrl || product.image" 
                :alt="product.name"
                class="object-cover w-full h-full"
              />
            </div>
            
            <div class="flex gap-2 pb-2 overflow-x-auto">
              <div 
                v-for="(image, index) in productImages" 
                :key="index"
                class="flex-shrink-0 w-16 h-16 overflow-hidden transition-all border-2 rounded-lg cursor-pointer"
                :class="currentImage === image ? 'border-black' : 'border-gray-200 hover:border-gray-400'"
                @click="currentImage = image"
              >
                <img :src="image" :alt="`Product ${index + 1}`" class="object-cover w-full h-full" />
              </div>
            </div>
          </div>

          <div class="flex flex-col p-6 lg:w-1/2">
            <div class="mb-4">
              <h2 class="mb-1 text-lg font-semibold text-gray-900">{{ product.brand || 'Brand' }}</h2>
              <h3 class="mb-2 text-base text-gray-700">{{ product.name }}</h3>
            </div>

            <p class="mb-4 font-serif text-sm text-gray-600">{{ cleanDescription || 'A floral fragrance inspired by Roman street style.' }}</p>

            <div class="flex items-center gap-4 mb-6">
              <div class="flex items-center">
                <div class="flex text-sm">
                      <svg 
                      v-for="n in 5" 
                      :key="n"
                      xmlns="http://www.w3.org/2000/svg" 
                      :fill="n <= Math.floor(product.ratings?.average || product.rating || 0) ? '#ffaa28' : 'none'"
                      viewBox="0 0 24 24" 
                      stroke-width="1.5" 
                      :stroke="n <= Math.floor(product.ratings?.average || product.rating || 0) ? '#ffaa28' : 'currentColor'"
                      class="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" 
                      />
                    </svg>
                </div>
                <span class="ml-2 text-sm font-medium">{{ product.totalRating || '2.7K' }} reviews</span>
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <i class="mr-1 ri-heart-line"></i>
                <span>{{ product.loves || '544.2K' }} loves</span>
              </div>
            </div>

            <div class="mb-6">
              <span class="text-2xl font-bold text-gray-900">${{ product.price || '145.00' }}</span>
            </div>

            <div class="mb-4">
              <div class="flex items-center w-24 border border-gray-300 rounded">
                <button @click="decreaseQuantity" class="flex-shrink-0 p-2 bg-white hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3 text-rose-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                  </svg>
                </button>
                <span class="flex-1 py-2 text-sm text-center">{{ quantity }}</span>
                <button @click="increaseQuantity" class="flex-shrink-0 p-2 bg-white hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3 text-rose-600">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="mb-6 space-y-3 pt-11">
              <button 
                @click="addToBasket"
                class="w-full px-6 py-3 font-semibold text-white transition-colors rounded bg-[#1f2937] hover:bg-gray-800"
              >
                Add to Basket
              </button>
              
              <button 
                @click="addToWishlist"
                class="flex items-center justify-center w-full gap-2 px-6 py-3 font-semibold text-gray-700 transition-colors border border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>

                Add to Lists
              </button>
            </div>

            <!-- Product Details Link -->
            <div class="mt-auto">
              <RouterLink 
                :to="`/products/${product._id || product.id}`"
                class="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                @click="closeModal"
              >
                See product details
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'add-to-cart', 'add-to-wishlist'])

const quantity = ref(1)
const currentImage = ref('')

// Compute product images array
const productImages = computed(() => {
  const images = []
  if (props.product.imageUrl) images.push(props.product.imageUrl)
  if (props.product.image) images.push(props.product.image)
  if (props.product.images && Array.isArray(props.product.images)) {
    images.push(...props.product.images.map(img => img.url || img))
  }
  return images.length > 0 ? images : ['/placeholder.svg?height=400&width=400']
})
const cleanDescription = computed(() => {
  let description = props.product.description || 'A floral fragrance inspired by Roman street style.'
  
  description = description
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  
  return description
})

// Watch for product changes to update current image
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    currentImage.value = productImages.value[0] || ''
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToBasket = () => {
  emit('add-to-cart', {
    product: props.product,
    quantity: quantity.value
  })
}

const addToWishlist = () => {
  emit('add-to-wishlist', props.product)
}
</script>
