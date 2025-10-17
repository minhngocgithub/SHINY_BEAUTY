<template>
  <div 
    :class="[
      'countdown',
      compact ? 'text-sm' : 'text-base'
    ]"
  >
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
      </svg>
      
      <span class="font-semibold text-gray-700">
        {{ label }}
      </span>
      
      <div class="flex gap-1">
        <div class="countdown-box">
          <span class="font-bold">{{ timeLeft.days }}</span>
          <span class="text-xs">d</span>
        </div>
        <span>:</span>
        <div class="countdown-box">
          <span class="font-bold">{{ timeLeft.hours }}</span>
          <span class="text-xs">h</span>
        </div>
        <span>:</span>
        <div class="countdown-box">
          <span class="font-bold">{{ timeLeft.minutes }}</span>
          <span class="text-xs">m</span>
        </div>
        <span>:</span>
        <div class="countdown-box">
          <span class="font-bold">{{ timeLeft.seconds }}</span>
          <span class="text-xs">s</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  endDate: {
    type: [String, Date],
    required: true
  },
  label: {
    type: String,
    default: 'Sale ends in:'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const now = ref(Date.now())
let interval = null

const timeLeft = computed(() => {
  const end = new Date(props.endDate).getTime()
  const diff = Math.max(0, end - now.value)
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
})

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.countdown-box {
    display: inline-block;
    align-items: baseline;
    gap: 0.125rem;
    padding: 0.25rem 0.5rem;
    background-color: #ffff;
    border-radius: 0.25rem;
    border-width: 1px;
    border-style: solid;
    border-color: #e5e7eb;;
}
</style>