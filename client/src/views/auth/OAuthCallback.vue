<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100"
  >
    <div class="w-full max-w-md p-6">
      <!-- Loading State -->
      <div v-if="isProcessing" class="text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 border-b-2 border-pink-500 rounded-full animate-spin"
        ></div>
        <h2 class="mb-2 text-xl font-semibold text-gray-800">
          Đang xử lý đăng nhập...
        </h2>
        <p class="text-gray-600">Vui lòng chờ trong giây lát</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="text-center">
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full"
        >
          <svg
            class="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-800">
          Đăng nhập thành công!
        </h2>
        <p class="mb-6 text-gray-600">Chào mừng bạn đến với ứng dụng</p>
        <button
          @click="redirectToHome"
          class="w-full px-4 py-3 font-medium text-white transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl hover:from-pink-600 hover:to-purple-700"
        >
          Đi đến trang chủ
        </button>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center">
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full"
        >
          <svg
            class="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h2 class="mb-2 text-xl font-semibold text-gray-800">
          Đăng nhập thất bại
        </h2>
        <p class="mb-6 text-gray-600">{{ error }}</p>
        <div class="space-y-3">
          <button
            @click="retryOAuth"
            class="w-full px-4 py-3 font-medium text-white transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl hover:from-pink-600 hover:to-purple-700"
          >
            Thử lại
          </button>
          <button
            @click="goToLogin"
            class="w-full px-4 py-3 font-medium text-gray-700 transition-all duration-200 border border-gray-300 rounded-2xl hover:bg-gray-50"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "OAuthCallback",
  setup() {
    const router = useRouter();
    const isProcessing = ref(true);
    const isSuccess = ref(false);
    const error = ref("");

    const processOAuthCallback = async () => {
      try {
        // Kiểm tra xem có phải là error route không
        if (window.location.pathname === "/oauth-error") {
          const urlParams = new URLSearchParams(window.location.search);
          const errorMessage =
            urlParams.get("message") || "Đăng nhập OAuth thất bại";
          error.value = errorMessage;
          isProcessing.value = false;
          return;
        }

        // Lấy URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");
        const userData = urlParams.get("userData");

        if (!accessToken || !refreshToken || !userData) {
          throw new Error("Thiếu thông tin xác thực từ OAuth provider");
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem("userInfo", JSON.stringify(user));

        // Xóa URL parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Đánh dấu thành công
        isSuccess.value = true;
        isProcessing.value = false;

        // Tự động redirect sau 3 giây
        setTimeout(() => {
          redirectToHome();
        }, 3000);
      } catch (err) {
        console.error("OAuth Callback Error:", err);
        error.value = err.message || "Xử lý đăng nhập OAuth thất bại";
        isProcessing.value = false;
      }
    };

    const redirectToHome = () => {
      router.push("/");
    };

    const retryOAuth = () => {
      router.push("/Register-Page");
    };

    const goToLogin = () => {
      router.push("/Login-Page");
    };

    onMounted(() => {
      processOAuthCallback();
    });

    return {
      isProcessing,
      isSuccess,
      error,
      redirectToHome,
      retryOAuth,
      goToLogin,
    };
  },
};
</script>

<style scoped>
/* Animation cho loading spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 