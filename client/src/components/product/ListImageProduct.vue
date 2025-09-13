<template>
    <div class="w-full grid grid-cols-2 gap-4">
    <div v-for="item in images" :key="item.id" class="relative">
      <div class="w-6 h-6 flex justify-center items-center cursor-pointer absolute top-2 right-2 bg-white rounded-full"
           @click="removeImage(item.id)"
      >
        <i class="ri-close-fill text-xl"></i>
      </div>
      <LazyImg class-style="w-full h-[150px] object-cover rounded-md" :src="item.url" alt="image" />
    </div>
  </div>
</template>
<script setup>
import LazyImg from '../atoms/LazyImg.vue'

const props = defineProps({
    images: {
        type: Array,
        default: () => [],
    },
    modalValue: {
        type: Array,
        default: () => [],
    }
})

const emits = defineEmits([' update:modelValue '])
const removeImg = (id) => {
    const newImage = props.images.filter((item) => item.id !== id)
    emits('update:modelValue', newImage)
}
</script>
