<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Tài khoản liên kết</h3>
      <button
        @click="refreshAccounts"
        class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>

    <div class="space-y-4">
      <!-- Google Account -->
      <div
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
          >
            <svg class="w-5 h-5 text-red-600" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Google</h4>
            <p class="text-sm text-gray-500">
              {{ user.googleId ? "Đã liên kết" : "Chưa liên kết" }}
            </p>
          </div>
        </div>
        <button
          v-if="user.googleId"
          @click="unlinkAccount('google')"
          :disabled="isUnlinking"
          class="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {{ isUnlinking ? "Đang hủy..." : "Hủy liên kết" }}
        </button>
        <button
          v-else
          @click="linkAccount('google')"
          :disabled="isLinking"
          class="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {{ isLinking ? "Đang liên kết..." : "Liên kết" }}
        </button>
      </div>

      <!-- Facebook Account -->
      <div
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-blue-600"
              fill="#1877F2"
              viewBox="0 0 24 24"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Facebook</h4>
            <p class="text-sm text-gray-500">
              {{ user.facebookId ? "Đã liên kết" : "Chưa liên kết" }}
            </p>
          </div>
        </div>
        <button
          v-if="user.facebookId"
          @click="unlinkAccount('facebook')"
          :disabled="isUnlinking"
          class="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {{ isUnlinking ? "Đang hủy..." : "Hủy liên kết" }}
        </button>
        <button
          v-else
          @click="linkAccount('facebook')"
          :disabled="isLinking"
          class="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {{ isLinking ? "Đang liên kết..." : "Liên kết" }}
        </button>
      </div>

      <!-- Twitter Account -->
      <div
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-sky-600"
              fill="#1DA1F2"
              viewBox="0 0 24 24"
            >
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">Twitter</h4>
            <p class="text-sm text-gray-500">
              {{ user.twitterId ? "Đã liên kết" : "Chưa liên kết" }}
            </p>
          </div>
        </div>
        <button
          v-if="user.twitterId"
          @click="unlinkAccount('twitter')"
          :disabled="isUnlinking"
          class="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {{ isUnlinking ? "Đang hủy..." : "Hủy liên kết" }}
        </button>
        <button
          v-else
          @click="linkAccount('twitter')"
          :disabled="isLinking"
          class="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {{ isLinking ? "Đang liên kết..." : "Liên kết" }}
        </button>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="message"
      class="mt-4 p-3 rounded-md"
      :class="
        messageType === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      "
    >
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../store/auth.store";
import {
  linkOAuthAccount,
  unlinkOAuthAccount,
} from "../../service/auth.service";

export default {
  name: "OAuthAccounts",
  setup() {
    const authStore = useAuthStore();
    const isLinking = ref(false);
    const isUnlinking = ref(false);
    const message = ref("");
    const messageType = ref("success");

    const user = computed(() => authStore.user || {});

    const showMessage = (msg, type = "success") => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = "";
      }, 5000);
    };

    const linkAccount = async (provider) => {
      isLinking.value = true;
      try {
        // Redirect to OAuth provider
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        window.location.href = `${baseUrl}/api/v1/auth/oauth/${provider}`;
      } catch (error) {
        console.error("Link account error:", error);
        showMessage("Không thể liên kết tài khoản", "error");
      } finally {
        isLinking.value = false;
      }
    };

    const unlinkAccount = async (provider) => {
      if (!confirm(`Bạn có chắc muốn hủy liên kết tài khoản ${provider}?`)) {
        return;
      }

      isUnlinking.value = true;
      try {
        await unlinkOAuthAccount({ provider });
        showMessage(`Đã hủy liên kết tài khoản ${provider}`);
        // Refresh user data
        await authStore.getUserInfo();
      } catch (error) {
        console.error("Unlink account error:", error);
        showMessage("Không thể hủy liên kết tài khoản", "error");
      } finally {
        isUnlinking.value = false;
      }
    };

    const refreshAccounts = () => {
      authStore.getUserInfo();
    };

    onMounted(() => {
      if (!authStore.user) {
        authStore.getUserInfo();
      }
    });

    return {
      user,
      isLinking,
      isUnlinking,
      message,
      messageType,
      linkAccount,
      unlinkAccount,
      refreshAccounts,
    };
  },
};
</script> 