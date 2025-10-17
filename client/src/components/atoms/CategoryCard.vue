<template>
  <div 
    class="p-6 transition-all bg-white border border-gray-200 rounded-lg cursor-pointer category-card hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
    @click="$emit('click')"
  >
    <div class="flex flex-col items-center gap-3 text-center">
      <!-- Icon with dynamic color -->
      <div 
        class="flex items-center justify-center w-16 h-16 rounded-lg"
        :class="iconBgClass"
      >
        <component 
          :is="heroIcon" 
          :class="iconColorClass"
          class="w-8 h-8"
        />
      </div>
      
      <!-- Category Name -->
      <h3 class="text-sm font-medium leading-tight text-gray-900">
        {{ category.name }}
      </h3>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  ShoppingBagIcon,
  BeakerIcon,
  SparklesIcon,
  HeartIcon,
  CubeIcon,
  SwatchIcon,
  FireIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const heroIcons = {
  ShoppingBagIcon,
  BeakerIcon,
  SparklesIcon,
  HeartIcon,
  CubeIcon,
  SwatchIcon,
  FireIcon,
  TagIcon
}

const heroIcon = computed(() => {
  return heroIcons[props.category.icon] || ShoppingBagIcon
})

const iconColorClass = computed(() => {
  const colors = {
    green: 'text-green-600',
    gray: 'text-gray-500',
    red: 'text-red-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600'
  }
  return colors[props.category.color] || 'text-gray-500'
})

const iconBgClass = computed(() => {
  const bgColors = {
    green: 'bg-green-50',
    gray: 'bg-gray-50',
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    orange: 'bg-orange-50'
  }
  return bgColors[props.category.color] || 'bg-gray-50'
})
</script>