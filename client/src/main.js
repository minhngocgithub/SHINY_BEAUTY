import { createApp } from 'vue'
import App from './App.vue'
import router from './router/routers'
import { createPinia } from 'pinia'
import './assets/scss/app.css'
import { initAuthStore } from './store/index.store'
import LazyImg from './components/atoms/LazyImg.vue'
const initApp = async () => {
    const app = createApp(App)
    app.use(createPinia())
    .use(router)
    
    await initAuthStore()
    app.component('LazyImg', LazyImg)
    .mount('#app')
}
initApp()
