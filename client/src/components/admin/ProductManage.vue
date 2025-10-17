<template>
  <div class="relative flex flex-col w-full h-full p-10 bg-[#fafafa] pt-10 rounded-[8px] py-5">
    <header class="flex justify-between w-full gap-2 pb-5">
      <div>
        <h1 class="text-2xl font-semibold">All products</h1>
        <nav class="text-sm" aria-label="Breadcrumb">
          <ol class="inline-flex p-0 list-none">
            <li class="flex items-center">
              <RouterLink to="/" class="text-gray-500">Dashboard</RouterLink>
              <span class="mx-2 text-gray-500">/</span>
            </li>
            <li class="text-gray-700">Products</li>
          </ol>
        </nav>
      </div>
      <div class="sticky top-0 flex gap-2">
        <button 
          @click="onCreate" 
          class="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      </div>
    </header>

    <div class="flex w-full gap-5">
      <div class="relative w-full overflow-x-auto">
        <table class="w-full text-sm text-left rtl:text-right">
          <thead class="text-xs text-gray-700 uppercase bg-gray-200">
            <tr>
              <th scope="col" class="px-6 py-3">Product name</th>
              <th scope="col" class="px-6 py-3">Sold</th>
              <th scope="col" class="px-6 py-3">Category</th>
              <th scope="col" class="px-6 py-3">Price</th>
              <th scope="col" class="px-6 py-3">Stock</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product._id" class="bg-white border-b hover:bg-gray-50">
              <th scope="row" class="max-w-[300px] px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <img 
                    :src="product.image?.url" 
                    :alt="product.name"
                    class="object-cover w-10 h-10 mr-4 rounded-lg"
                  />
                  <p class="truncate">{{ product.name }}</p>
                </div>
              </th>
              <td class="px-6 py-4">{{ product.sold }}</td>
              <td class="px-6 py-4">{{ product.category }}</td>
              <td class="px-6 py-4">${{ product.price }}</td>
              <td class="px-6 py-4">{{ product.countInstock }}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button 
                    @click="onEdit(product._id)"
                    class="flex items-center gap-1 px-3 py-2 text-white bg-yellow-500 rounded"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    @click="onDelete(product._id)"
                    class="flex items-center gap-1 px-3 py-2 text-white rounded bg-rose-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onBeforeMount } from 'vue'
import BreadCrumb from '../commons/BreadCrumb.vue'
import LazyImg from '../atoms/LazyImg.vue'
import { useAuthStore } from '../../store/auth.store'
const authStore = useAuthStore().state
import AButton from '../atoms/Abutton.vue'
// 
import { getAllProductsApi } from '../../service/product.service'
import { useRouter } from 'vue-router'
const router = useRouter()


const routes = ref([
    {
        name: 'HomeView',
        path: '/'
    },
    {
        name: 'ProductManage',
        path: '/admin/manage-product'
    }
])
const userData = ref(null)
onBeforeMount( async() => {
    console.log('authStore: ', authStore);
    userData.value = { ...authStore?.user }
    await getAllProducts()
})
const products = ref([])
const getAllProducts = async() => {
    const res = await getAllProductsApi()
    products.value = res.data
    console.log('products data: ', products.value);
}
const onEdit = (id) => {
    console.log('onEdit');
    router.push({
        name: 'update-product',
        params: {
            id
        }
    })
}
</script>