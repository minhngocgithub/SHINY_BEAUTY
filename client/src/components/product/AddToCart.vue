<template>
  <div class="space-y-4 add-to-cart-section">
    <!-- Quantity Selector -->
    <div class="flex items-center gap-4">
      <label class="text-sm font-medium text-gray-700">Quantity:</label>
      <div class="flex items-center border rounded-lg">
        <div class="flex items-center w-24 border border-gray-300 rounded">
          <button
            @click="decreaseQuantity"
            class="flex-shrink-0 p-2 bg-white hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-3 text-rose-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
          <span class="flex-1 py-2 text-sm text-center">{{ quantity }}</span>
          <button
            @click="increaseQuantity"
            class="flex-shrink-0 p-2 bg-white hover:bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-3 text-rose-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          </button>
        </div>
      </div>

      <span class="text-sm text-gray-500">
        {{ product.countInstock }} available
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <button
        @click="handleAddToCart"
        :disabled="product.countInstock === 0 || isProcessing"
        class="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="!isProcessing"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ isProcessing ? "Adding..." : "Add to Cart" }}
      </button>

      <button
        @click="handleBuyNow"
        :disabled="product.countInstock === 0 || isProcessing"
        class="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-semibold text-white transition bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="!isProcessing"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ isProcessing ? "Processing..." : "Buy Now" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["add-to-cart", "buy-now"]);

const quantity = ref(1);

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function increaseQuantity() {
  if (quantity.value < props.product.countInstock) {
    quantity.value++;
  }
}

function handleAddToCart() {
  emit("add-to-cart", {
    product: props.product,
    quantity: quantity.value,
  });
}

function handleBuyNow() {
  emit("buy-now", {
    product: props.product,
    quantity: quantity.value,
  });
}
</script>