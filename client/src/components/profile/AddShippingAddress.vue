<template>
  <div class="w-full border-[1px] rounded-lg p-4">
    <div class="flex w-full justify-between">
      <div class="flex items-center gap-2">
        <input id="makeDefault" v-model="shippingInfo.isMainAddress" type="checkbox" name="isMainAddress" />
        <label for="makeDefault" class="text-base block">Is default </label>
      </div>
      <div>
        <i class="ri-more-fill"></i>
      </div>
    </div>
    <div class="mt-2">
      <div class="text-base mt-2 flex items-center gap-2 font-medium">
        <i class="ri-user-fill text-2xl text-[#f25d18]"></i>
        <input
          id="address"
          v-model="shippingInfo.address"
          type="text"
          name="name"
          placeholder="Enter your address..."
          class="w-full border-[2px] border-primary-300 rounded-md"
        />
      </div>
      <div class="text-base mt-2 flex items-center gap-2 font-medium">
        <i class="ri-phone-fill text-2xl text-[#f25d18]"></i>
        <input
          id="phoneNumber"
          v-model="shippingInfo.phone"
          type="text"
          name="phoneNumber"
          placeholder="Enter your phone number..."
          class="w-full border-[2px] border-primary-300 rounded-md"
        />
      </div>
      <div class="mt-2">
        <div class="flex gap-2">
          <ADropdown
            v-model="address.city"
            class="w-full h-full"
            is-required="true"
            label="City"
            :options="city"
            placeholder="Select category..."
            required
          />
          
        </div>
      </div>
      <div class="text-base mt-2 flex items-center gap-2 font-medium">
        <i class="ri-map-pin-2-fill text-2xl text-[#f25d18]"></i>
        <input
          id="postalCode"
          v-model="address.postalCode"
          type="text"
          name="address"
          placeholder="Enter your potalCode..."
          class="w-full border-[2px] border-primary-300 rounded-md"
        />
      </div>
    </div>
    <p class="text-rose-600 mt-2">{{ error }}</p>
    <div class="flex mt-3 gap-2 justify-end">
      <AButton title="Save" class="w-fit text-white" @click="onSave">
        <template #left>
          <i class="ri-save-2-fill"></i>
        </template>
      </AButton>
      <!-- cancel -->
      <AButton title="Cancel" type="cancel" class="w-fit text-white" @click="$emit('close')">
        <template #left>
          <i class="ri-close-fill"></i>
        </template>
      </AButton>
    </div>
  </div>
</template>

<script setup>
import AButton from '../atoms/Abutton.vue'
import ADropdown from '../atoms/ADropdown.vue'
import { computed, ref } from 'vue'



const props = defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
})

const emits = defineEmits(['close', 'added'])

const shippingInfo = ref({
  address: '',
  phone: '',
  city: '',
  postalCode: '',
  isMainAddress: false,
})

const city = computed(() => {
  return props.locations.map((item) => {
    return {
      name: item.name,
      id: item.id,
    }
  })
})

const error = ref('')
const onSave = async () => {
  try {
    if (!shippingInfo.value.city) {
      error.value = 'Please select city'
      return
    }
    if (!shippingInfo.value.postalCode) {
      error.value = 'Please select postalCode'
      return
    }
    error.value = ''
    const body = {
      address: shippingInfo.value.address,
      phone: {
        countryCode: '+84',
        nationalNumber: shippingInfo.value.phone,
      },
      city: shippingInfo.value.city,
      postalCode: shippingInfo.value.postalCode,
      isMainAddress: shippingInfo.value.isMainAddress,
    }
    
    
    emits('added', { ...shippingInfo.value })
  } catch (error) {
    console.log('error', error)
    
  }
}
</script>
