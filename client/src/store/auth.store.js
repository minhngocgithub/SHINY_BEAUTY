import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const state = ref({
        user: null,
        isLoggedIn: false,
    })
    const setAuthStore = (data) => {
    state.value = data 

    if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
    }
    localStorage.setItem('authState', JSON.stringify(state.value))
}
    const loadFromStorage = () => {
        const savedState = localStorage.getItem('authState');
        if (savedState) {
            state.value = JSON.parse(savedState);
        }
    }
    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('authState')
        state.value = { user: null, isLoggedIn: false }
    }
    return {
        state,
        setAuthStore,
        loadFromStorage,
        logout,
        
    }
})