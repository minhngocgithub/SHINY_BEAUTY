<template>
  <div class="recently-viewed">
    <h3 class="mb-6 text-xl font-bold">Recently Viewed</h3>
    
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
      <router-link
        v-for="product in recentProducts"
        :key="product._id"
        :to="`/products/${product._id}`"
        class="p-2 transition-all duration-200 bg-white border border-gray-200 rounded-lg group hover:border-rose-300 hover:shadow-md"
      >
        <div class="mb-2 overflow-hidden bg-gray-100 rounded-lg aspect-square">
          <img
            :src="getProductImage(product)"
            :alt="product.name"
            class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <h4 class="overflow-hidden text-xs font-medium text-gray-900 transition-colors group-hover:text-rose-600" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
          {{ product.name }}
        </h4>
        
        <p class="mt-1 text-xs font-bold text-gray-900">
          ${{ product.price?.toFixed(2) }}
        </p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProductApi } from '../../service/product.service'

const route = useRoute()
const recentProducts = ref([])

async function loadRecentlyViewed() {
  try {
    const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    const products = []
    
    const currentProductId = route.params.id
    const filteredIds = recentIds.filter(id => id !== currentProductId)
    
    for (const id of filteredIds.slice(0, 12)) {
      try {
        const res = await getProductApi(id)
        products.push(res.data.productData)
      } catch (err) {
        console.error('Failed to load product:', id)
      }
    }
    
    recentProducts.value = products
  } catch (err) {
    console.error('Failed to load recently viewed:', err)
  }
}

function getProductImage(product) {
  if (Array.isArray(product.image)) {
    return product.image[0]?.url || product.image[0] || '/placeholder.png'
  }
  return product.image?.url || product.image || '/placeholder.png'
}

watch(() => route.params.id, () => {
  loadRecentlyViewed()
})

onMounted(() => {
  loadRecentlyViewed()
})
</script>
