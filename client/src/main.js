import { createApp } from 'vue'
import './assets/scss/app.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './assets/scss/aos.css'

import App from './App.vue'
import router from './router/routers' 
import { createPinia } from 'pinia'
import { initAuthStore } from './store/index.store'
import LazyImg from './components/atoms/LazyImg.vue'

const initializeAOS = () => {
  AOS.init({
    duration: 800,
    delay: 0,
    once: true,
    mirror: false,
    offset: 120,
    easing: 'ease-out-cubic',
    
    disable: function() {
      // Disable on mobile devices or when user prefers reduced motion
      const maxWidth = 768
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isLowEndDevice = navigator.deviceMemory && navigator.deviceMemory < 4
      
      return window.innerWidth < maxWidth || reducedMotion || isLowEndDevice
    },
    
    debounceDelay: 50,
    throttleDelay: 99,
    
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false
  })
}

const initApp = async () => {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  
  await initAuthStore()
  app.component('LazyImg', LazyImg)
  
  app.config.globalProperties.$aos = {
    refresh: () => {
      AOS.refresh()
    },
    refreshHard: () => {
      AOS.refreshHard()
    }
  }
  app.mount('#app')
  await app.$nextTick?.() || new Promise(resolve => setTimeout(resolve, 0))
  initializeAOS()
}

initApp()