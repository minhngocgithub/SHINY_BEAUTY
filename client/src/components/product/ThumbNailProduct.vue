<template>
<div class="max-md:w-full max-md:min-w-[unset] w-[400px] min-w-[400px]">
    <div id="images" class="w-full bg-slate-300 h-[400px] overflow-hidden rounded-md mb-2">
        <div
            v-for="(thumb, index) in listImages"
            v-show="(!currentImageSelected && index === 0) || currentImageSelected?.id === thumb.id"
            :key="thumb.id"
            class="object-cover w-full h-full cursor-zoom-in"
            @click="openImage"
        >
            <LazyImg :id="thumb.id" class-style="w-full h-full object-cover cursor-zoom-in" :src="thumb.url" alt="" />
        </div>
    </div>

    <swiper style="padding: 0 0px 10px 0px" class="w-full pb-2" :slides-per-view="'auto'" :space-between="5">
      <swiper-slide v-for="(thumb, index) in listImages" :key="thumb.id" style="width: auto" class="w-fit">
        <div
          class="hover:border-gray-700 border-[2px] border-transparent overflow-hidden cursor-zoom-in w-[80px] h-[80px] rounded-md"
          @mouseover="hoverOnChange(index)"
        >
          <LazyImg class-style="w-full h-full object-cover" :src="thumb.url" alt="" />
        </div>
      </swiper-slide>
    </swiper>
</div>
    
</template>

<script setup>
import { ref, computed, watch, onMounted} from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import LazyImg from '../atoms/LazyImg.vue'
// Components
const props = defineProps({
    product: {
        type: Object,
        required: true,
    },
    currentType: {
        type: Object,
        default: null,
    },
})
const listImages = computed(() => {
    const imagesInTypes = props.product.type.map((type) => ({
        url: type.imageUrl,
        id: type.id
    }))
    const imagesList = [...imagesInTypes, ...props.product.images ]
    console.log('List image ->>', imagesList)
    return imagesList
})
const currentImgSelected = ref(null)
watch(
    () => props.currentType,
    () => {
        if(props.currentType) {
            currentImgSelected.value = props.currentType
        }
    }
)
onMounted(() => {
    currentImgSelected.value = listImages.value[0]
})
const hoverOnChange = (index) => {
    console.log('HoverOnChange', index);
    currentImgSelected.value = listImages.value[index]
}
const viewerInstance = ref(null)
const openImage = () => {
    viewerInstance.value = new Viewer(document.getElementById('images'), {
        inline: false,
        viewed() {},
    })
}
</script>
