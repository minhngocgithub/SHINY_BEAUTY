

<template>
  <div class="flex justify-center items-center">
    <div
      class="relative rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-white"
      :style="avatarSizeStyle"
    >
      <img
        :src="imageUrl || currentAvatar"
        alt="avatar"
        class="block w-full h-full object-cover"
        :style="avatarImgStyle"
      />
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  file: {
    type: File,
    default: null,
  },
  currentAvatar: {
    type: String,
    default: "",
  },
  size: {
    type: [Number, String],
    default: 45,
  },
});

const imageUrl = ref("");

watch(
  () => props.file,
  (newFile) => {
    if (newFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageUrl.value = e.target.result;
      };
      reader.readAsDataURL(newFile);
    } else {
      imageUrl.value = props.currentAvatar;
    }
  },
  { immediate: true }
);

const avatarSizeStyle = computed(() => ({
  width: typeof props.size === "number" ? `${props.size}px` : props.size,
  height: typeof props.size === "number" ? `${props.size}px` : props.size,
  minWidth: "32px",
  minHeight: "32px",
  maxWidth: "96px",
  maxHeight: "96px",
}));

const avatarImgStyle = computed(() => ({
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
}));
</script>