<script>
import axios from 'axios'
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
export default {
  name: 'App',
  components: {
    
  },

  data: () => ({
    //
  }),
}

</script>

<template>
<div>
    <router-view></router-view>
  
</div>

</template>

<style lang="scss" scoped>
body {
  scroll-behavior: smooth;
}

</style>
