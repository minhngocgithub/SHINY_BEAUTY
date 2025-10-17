<template>
  <div class="space-y-3 sale-program-badges">
    <div
      v-for="program in salePrograms"
      :key="program._id"
      class="p-4 border-2 rounded-lg"
      :class="getProgramClass(program.type)"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ getProgramIcon(program.type) }}</span>
          <div>
            <h4 class="font-bold text-gray-900">{{ program.name }}</h4>
            <p class="text-sm text-gray-600">{{ program.description }}</p>
          </div>
        </div>
        
        <div v-if="program.discountPercentage" class="text-right">
          <div class="text-2xl font-bold text-red-600">
            {{ program.discountPercentage }}%
          </div>
          <div class="text-xs text-gray-500">OFF</div>
        </div>
      </div>
      
      <!-- Countdown if applicable -->
      <Countdown
        v-if="program.endDate"
        :end-date="program.endDate"
        :compact="true"
      />
    </div>
  </div>
</template>

<script setup>
import Countdown from '../atoms/Countdown.vue'

defineProps({ 
  salePrograms: {
    type: Array,
    default: () => []
  }
})

function getProgramClass(type) {
  const classes = {
    'flash_sale': 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-300',
    'seasonal': 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300',
    'clearance': 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300',
    'bundle': 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300'
  }
  return classes[type] || 'bg-gray-50 border-gray-300'
}

function getProgramIcon(type) {
  const icons = {
    'flash_sale': '⚡',
    'seasonal': '🎉',
    'clearance': '🔥',
    'bundle': '📦'
  }
  return icons[type] || '💰'
}
</script>