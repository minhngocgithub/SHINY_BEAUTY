<script setup>
defineEmits(["close"]);
</script>
<template>
  <div
    class="fixed top-0 left-0 flex justify-center items-center z-10 w-screen h-screen bg-[#4c4e58b5]"
    @click="$emit('close')"
  >
    <div
      class="w-[90vw] max-w-[500px] h-auto min-h-[180px] bg-white rounded-xl p-4 sm:p-6 shadow-lg"
      @click.stop
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg sm:text-2xl font-semibold">
          <span>
            Profile
            <i class="ri-user-line text-base sm:text-xl"></i>
          </span>
        </h2>
        <div
          class="flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 bg-[#e5e5e5b5] cursor-pointer rounded-full transition hover:bg-gray-300"
          @click="$emit('close')"
        >
          <i class="ri-close-fill text-xl sm:text-2xl"></i>
        </div>
      </div>
      <!-- Nội dung modal ở đây -->
    </div>
  </div>
</template>