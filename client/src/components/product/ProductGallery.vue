<template>
  <div class="product-gallery">
    <div class="relative mb-4 overflow-hidden bg-gray-100 rounded-2xl aspect-square">
      <img
        :src="currentImage"
        :alt="productName"
        class="object-cover w-full h-full"
      />

       Navigation Arrows 
      <button
        v-if="images.length > 1"
        @click="previousImage"
        class="absolute p-3 transition -translate-y-1/2 bg-white rounded-full shadow-lg left-4 top-1/2 hover:bg-gray-50"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <button
        v-if="images.length > 1"
        @click="nextImage"
        class="absolute p-3 transition -translate-y-1/2 bg-white rounded-full shadow-lg right-4 top-1/2 hover:bg-gray-50"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      <button
        @click="openLightbox"
        class="absolute p-2 transition bg-white rounded-full shadow-lg top-4 right-4 hover:bg-gray-50"
      >
        <svg class="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/>
        </svg>
      </button>
    </div>
    <div class="flex gap-3">
      <button
        v-for="(image, index) in images"
        :key="index"
        @click="currentIndex = index"
        :class="[
          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition',
          currentIndex === index
            ? 'border-green-600 ring-2 ring-green-200'
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <img
          :src="image"
          :alt="`${productName} - ${index + 1}`"
          class="object-cover w-full h-full"
        />
      </button>
      <button
        v-if="video"
        @click="playVideo"
        class="relative flex items-center justify-center flex-shrink-0 w-20 h-20 overflow-hidden transition border-2 border-gray-200 rounded-lg hover:border-gray-300 bg-black/80"
      >
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
        </svg>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="showLightbox"
        @click="closeLightbox"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      >
        <button
          @click="closeLightbox"
          class="absolute text-white transition top-4 right-4 hover:text-gray-300"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <img
          :src="currentImage"
          :alt="productName"
          class="object-contain max-w-full max-h-full"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  video: {
    type: String,
    default: null
  },
  productName: {
    type: String,
    default: 'Product'
  }
})

const currentIndex = ref(0)
const showLightbox = ref(false)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || '/placeholder.png'
})

function previousImage() {
  currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

function openLightbox() {
  showLightbox.value = true
}

function closeLightbox() {
  showLightbox.value = false
}

function playVideo() {
  if (props.video) {
    window.open(props.video, '_blank')
  }
}
</script>
