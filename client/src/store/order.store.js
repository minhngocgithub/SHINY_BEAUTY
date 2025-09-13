import { defineStore } from "pinia";
import { ref } from 'vue'

export const useOrderStore = defineStore('orderStore', () => {
    const state = ref({
        orders: []
        
    })

    
})