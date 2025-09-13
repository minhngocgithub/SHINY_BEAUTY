<template>
    <div>
        <img v-show="src && isLoaded" :id="id" :alt="alt" :class="classStyle" :src="src" @load="onLoaded" />
        <img v-show="!src || !isLoaded" :id="id" :alt="alt" :class="classStyle" src="" />
    </div>
</template>

<script setup>
import { ref } from 'vue'
const isLoaded = ref(false)
defineProps({
    src: {
        type: String,
        require: false,
        default: ''
    },
    classStyle: {
        type: String,
        require: false,
        default: ''
    },
    id: {
        type: String,
        require: false,
        default: ''
    },
    alt: {
        type: String,
        require: false,
        default: '',
    }
})
const onLoaded = () => {
    console.log('loaded');
    isLoaded.value = true
    
}
</script>