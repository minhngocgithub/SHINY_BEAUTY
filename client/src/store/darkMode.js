import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDarkMode = defineStore('darkMode', () => {
    const isEnable = ref(false)

    function setMode(payload = null) {
        isEnable.value = payload !== null ? payload : !isEnable.value

        if(typeof document !== 'undefined') {
            document.body.classList[isEnable.value ? 'add' : 'remove']('dark-scrollbars')

            document.documentElement.classList[isEnable.value ? 'add' : 'remove'](
                'dark',
                'dark-scrollbars-compat'
            )
        }
    }
    return {
        isEnable,
        setMode
    }
}) 
