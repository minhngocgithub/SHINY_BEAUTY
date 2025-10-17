<template>
  <div class="flex gap-3 action-buttons">
    <button
      @click="$emit('add-wishlist')"
      class="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-gray-700 transition border-2 border-gray-300 rounded-lg hover:border-rose-500 hover:text-rose-500"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
      Add to Wishlist
    </button>
    
    <button
      @click="$emit('share')"
      class="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-gray-700 transition border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
      </svg>
      Share
    </button>
  </div>
</template>

<script setup>
defineEmits(['add-wishlist', 'share'])
</script>