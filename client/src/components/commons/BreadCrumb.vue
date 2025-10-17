<template>
  <nav aria-label="Breadcrumb" class="text-sm">
    <ol class="flex flex-wrap items-center gap-2">
      <li v-for="(item, index) in items" :key="index" class="flex items-center gap-2">
        <router-link
          v-if="index < items.length - 1"
          :to="item.to"
          class="text-gray-600 transition hover:text-rose-600"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="font-medium text-gray-900">
          {{ item.label }}
        </span>
        
        <svg v-if="index < items.length - 1" class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>