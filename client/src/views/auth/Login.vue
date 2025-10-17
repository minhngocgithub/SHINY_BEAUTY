<template>
  <div
    class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100"
  >
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
    >
      <Loading />
    </div>
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl"
        >
          <svg
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1
          class="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text"
        >
          Chào mừng trở lại
        </h1>
        <p class="mt-2 text-gray-600">Đăng nhập vào tài khoản của bạn</p>
      </div>

      <div
        class="p-8 border shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl border-white/20"
      >
        <div class="mb-6 space-y-3">
          <button
            @click="loginWithGoogle"
            class="flex items-center justify-center w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-2xl hover:bg-gray-50 group"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
            <span class="font-medium text-gray-700">Đăng nhập với Google</span>
          </button>

          <button
            @click="loginWithFacebook"
            class="flex items-center justify-center w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-2xl hover:bg-gray-50 group"
          >
            <svg class="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <span class="font-medium text-gray-700"
              >Đăng nhập với Facebook</span
            >
          </button>

          <button
            @click="loginWithTwitter"
            class="flex items-center justify-center w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-2xl hover:bg-gray-50 group"
          >
            <svg class="w-5 h-5 mr-3" fill="#1DA1F2" viewBox="0 0 24 24">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
            <span class="font-medium text-gray-700">Đăng nhập với Twitter</span>
          </button>
        </div>
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 text-gray-500 bg-white"
              >Hoặc đăng nhập với email</span
            >
          </div>
        </div>

        <Form @submit="loginUser" :validation-schema="schema" class="space-y-5">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Email</label>
            <div class="relative">
              <Field
                name="email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-3 transition-all duration-200 border border-gray-200 pl-11 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50/50"
              />
              <svg
                class="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <ErrorMessage name="email" class="text-sm text-red-500" />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Mật khẩu</label>
            <div class="relative">
              <Field
                name="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu"
                class="w-full px-4 py-3 transition-all duration-200 border border-gray-200 pl-11 pr-11 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50/50"
              />
              <svg
                class="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <svg
                  v-if="showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <ErrorMessage name="password" class="text-sm text-red-500" />
          </div>
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span class="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <router-link
              to="/forgot-password"
              class="text-sm font-medium text-pink-600 hover:text-pink-700"
            >
              Quên mật khẩu?
            </router-link>
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-2xl font-medium hover:from-pink-600 hover:to-purple-700 focus:ring-4 focus:ring-pink-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {{ isLoading ? "Đang đăng nhập..." : "Đăng nhập" }}
          </button>
        </Form>
        <div class="pt-6 mt-6 text-center border-t border-gray-100">
          <p class="text-gray-600">
            Chưa có tài khoản?
            <router-link
              to="/Register-Page"
              class="ml-1 font-medium text-pink-600 hover:text-pink-700"
            >
              Đăng ký ngay
            </router-link>
          </p>
        </div>
      </div>
      <div
        v-if="message"
        class="p-4 mt-4 border border-red-200 bg-red-50 rounded-2xl"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 mr-2 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-sm text-red-700">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { jwtDecode } from "jwt-decode";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { loginApi, getOAuthUrls } from "../../service/auth.service";
import { initAuthStore } from "../../store/index.store";
import Loading from "../../components/Loading.vue";
import { useAuthStore } from "../../store/auth.store";
const schema = yup.object({
  email: yup
    .string()
    .required("Email là bắt buộc!")
    .email("Email không hợp lệ!")
    .max(50, "Email tối đa 50 ký tự!"),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc!")
    .min(5, "Mật khẩu tối thiểu 5 ký tự!")
    .max(12, "Mật khẩu tối đa 12 ký tự!"),
});
const router = useRouter();
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const message = ref("");
const oauthUrls = ref({});
const authStore = useAuthStore();
const loginUser = async (user) => {
  message.value = "";
  isLoading.value = true;

  try {
    await loginApi(user).then((res) => {
      const data = res["data"];
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.newRefreshToken);
      const user = jwtDecode(data.accessToken);

      if (user && user.isAdmin) {
        router.push({ path: "/admin" });
      } else if (user && !user.isAdmin) {
        router.push({ path: "/" });
      }
    });

    await initAuthStore();
    window.location.reload();
  } catch (error) {
    message.value =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await getOAuthUrls();
    oauthUrls.value = response.data.oauthUrls;
  } catch (error) {
    console.error("Failed to get OAuth URLs:", error);
  }
});

const loginWithGoogle = () => {
  if (oauthUrls.value.google) {
    window.location.href = oauthUrls.value.google;
  } else {
    console.error("Google OAuth URL not available");
  }
};

const loginWithFacebook = () => {
  if (oauthUrls.value.facebook) {
    window.location.href = oauthUrls.value.facebook;
  } else {
    console.error("Facebook OAuth URL not available");
  }
};

const loginWithTwitter = () => {
  if (oauthUrls.value.twitter) {
    window.location.href = oauthUrls.value.twitter;
  } else {
    console.error("Twitter OAuth URL not available");
  }
};
</script>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}

/* Glassmorphism effect */
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}

/* Custom focus styles */
input:focus {
  outline: none;
}
</style>
