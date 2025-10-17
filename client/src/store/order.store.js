import { defineStore } from "pinia"
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'
import {
    getMyOrdersApi,
    getOrderByIdApi,
    createOrderApi,
    cancelOrderApi
} from '../service/order.service'

export const useOrderStore = defineStore('orderStore', () => {
    const authStore = useAuthStore()

    // State
    const orders = ref([])
    const currentOrder = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Computed
    const orderCount = computed(() => orders.value.length)

    const pendingOrders = computed(() => 
        orders.value.filter(order => order.status === 'pending')
    )

    const completedOrders = computed(() => 
        orders.value.filter(order => order.status === 'delivered')
    )

    const cancelledOrders = computed(() => 
        orders.value.filter(order => order.status === 'cancelled')
    )

    // Actions
    const fetchMyOrders = async () => {
        try {
            loading.value = true
            error.value = null

            if (!authStore.state.isLoggedIn) {
                orders.value = []
                return
            }

            const response = await getMyOrdersApi()

            if (response.data.success) {
                orders.value = response.data.orders || []
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch orders'
            console.error('Fetch orders error:', err)
        } finally {
            loading.value = false
        }
    }

    const getOrder = async (orderId) => {
        try {
            loading.value = true
            error.value = null

            const response = await getOrderByIdApi(orderId)

            if (response.data.success) {
                currentOrder.value = response.data.order
                return response.data.order
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to get order'
            console.error('Get order error:', err)
        } finally {
            loading.value = false
        }
    }

    const createOrder = async (orderData) => {
        try {
            loading.value = true
            error.value = null

            const response = await createOrderApi(orderData)

            if (response.data.success) {
                orders.value.push(response.data.order)
                return response.data.order
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create order'
            console.error('Create order error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const cancelOrder = async (orderId, reason) => {
        try {
            loading.value = true
            error.value = null

            const response = await cancelOrderApi(orderId, reason)

            if (response.data.success) {
                const orderIndex = orders.value.findIndex(o => o._id === orderId)
                if (orderIndex > -1) {
                    orders.value[orderIndex].status = 'cancelled'
                }
                return response.data.order
            }
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to cancel order'
            console.error('Cancel order error:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        orders,
        currentOrder,
        loading,
        error,

        orderCount,
        pendingOrders,
        completedOrders,
        cancelledOrders,

        fetchMyOrders,
        getOrder,
        createOrder,
        cancelOrder
    }
})
