<template>
  <div class="w-[80%] lg:w-[500px] h-[35px] border-[1px] flex rounded-md">
    <input
      v-model="keyword"
      type="text"
      placeholder="Enter product..."
      style="outline: none; border: none !important"
      class="h-full w-full border-0 bg-transparent rounded-md px-3"
      @keyup.enter="onSearch"
    />
    <button
      class="h-full bg-[#5a4098] cursor-pointer flex justify-center items-center rounded-tr rounded-br px-3"
      @click="onSearch"
    >
       
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span class="px-2 text-white">Search</span>
        
    </button>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const keyword = ref(router.query?.keyword || '')
const onSearch = () => {
  const newQuery = { ...router.query, keyword: keyword.value }
  router.push({ name: 'search', query: newQuery })
  console.log('search', newQuery)
}
</script>