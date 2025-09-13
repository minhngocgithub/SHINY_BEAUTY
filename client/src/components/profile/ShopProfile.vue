<template>
  <div class="min-h-screen bg-gray-50">
    <div class="relative">
      <!-- Loading State -->
      <Loading
        v-if="isLoading"
        class="loading-component spinner-border spinner-border-sm"
      ></Loading>
      <div v-if="authStore.user" class="space-y-4">
        <ModelProfile />
      </div>
    </div>
  </div>
</template>

<script>
import LazyImg from "../atoms/LazyImg.vue";
import Loading from "../Loading.vue";
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../store/auth.store";
import { useRouter } from "vue-router";
import { getInfo } from "../../service/auth.service";
import { initAuthStore } from "../../store/index.store";
import ModelProfile from "../profile/ModelProfile.vue";
import AddShippingAddress from "../profile/AddShippingAddress.vue";
import ModalChangePassword from "../profile/ModelChangePassword.vue";
import ModalChangeAvatar from "../profile/ModelChangeAvatar.vue";
export default {
  components: {
    LazyImg,
    Loading,
    ModelProfile,
    AddShippingAddress,
    ModalChangeAvatar,
    ModalChangePassword,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore().state;
    const isLoading = ref(false);
    const isAvatarModalOpen = ref(false);
    const isProfileModalOpen = ref(false);
    const isPasswordModalOpen = ref(false);
    const handleAvatarUpdate = (file) => {
      console.log("Updating avatar with file:", file);
    };

    const handleAddressSubmit = (address) => {
      console.log("New address submitted:", address);
    };
    const userInitials = computed(() => {
      if (!authStore.user?.name) return "";
      return authStore.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    });
    const getUserProfile = async () => {
      isLoading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const { data } = await getInfo();

        console.log(data);

        initAuthStore();
      } catch (error) {
        console.log("Error fetching profile:", error);
      } finally {
        isLoading.value = false;
      }
    };
    onMounted(() => {
      if (localStorage.getItem("newAccessToken")) {
        getUserProfile();
      }
    });
    return {
      router,
      userInitials,
      getUserProfile,
      authStore,
      isLoading,
    };
  },
};
</script>
<style scoped>
.loading-component {
  position: fixed;
  top: 40%; /* Position it in the middle vertically */
  left: 50%; /* Position it in the middle horizontally */
  display: flex; /* Center the loading component */
  align-items: center;
  justify-content: center;
  z-index: 100; /* Make sure it's above other content */
  background-color: rgba(
    255,
    255,
    255,
    0.8
  ); /* Optional: Semi-transparent background */
}
</style>