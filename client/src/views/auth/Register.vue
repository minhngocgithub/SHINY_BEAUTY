<template>
  <div
    class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100"
  >
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <div class="p-6 bg-white shadow-2xl rounded-2xl">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 border-b-2 border-pink-500 rounded-full animate-spin"
          ></div>
          <span class="font-medium text-gray-700">Đang xử lý...</span>
        </div>
      </div>
    </div>

    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl"
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
          Tạo tài khoản
        </h1>
        <p class="mt-2 text-gray-600">Đăng ký để bắt đầu trải nghiệm</p>
      </div>

      <div
        class="p-6 border shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl border-white/20 md:p-8"
      >
        <!-- OAuth Buttons -->
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
              >Hoặc đăng ký với email</span
            >
          </div>
        </div>

        <!-- Step 1: Nhập thông tin -->
        <Form
          v-if="currentStep === 1"
          @submit="requestOTP"
          :validation-schema="schema"
          class="space-y-5"
        >
          <!-- Name -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Họ và tên</label>
            <div class="relative">
              <Field
                name="name"
                type="text"
                placeholder="David John..."
                class="w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
            <ErrorMessage name="name" class="text-sm text-red-500" />
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700"
              >Email (Gmail)</label
            >
            <div class="relative">
              <Field
                name="email"
                type="email"
                placeholder="your@gmail.com"
                class="w-full px-4 py-3 transition-all duration-200 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50/50"
              />
            </div>
            <ErrorMessage name="email" class="text-sm text-red-500" />
          </div>

          <!-- Password -->
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

          <!-- Submit -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-2xl font-medium hover:from-pink-600 hover:to-purple-700 focus:ring-4 focus:ring-pink-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Gửi mã xác thực
          </button>

          <!-- Link to login -->
          <div class="pt-2 text-center">
            <span class="text-gray-600">Bạn đã có tài khoản?</span>
            <router-link
              to="/Login-Page"
              class="ml-1 font-medium text-pink-600 hover:text-pink-700"
            >
              Đăng nhập!
            </router-link>
          </div>
        </Form>

        <!-- Step 2: OTP -->
        <Form
          v-if="currentStep === 2"
          @submit="verifyAndRegister"
          :validation-schema="otpSchema"
          class="space-y-5"
        >
          <div class="text-center">
            <h2 class="mb-2 text-xl font-semibold text-gray-800">
              Mã xác thực
            </h2>
            <p class="text-sm text-gray-600">
              Chúng tôi đã gửi mã đến
              <span class="font-medium text-gray-800">{{
                userInfo.email
              }}</span>
            </p>
          </div>

          <!-- OTP -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700"
              >Nhập mã gồm 6 chữ số</label
            >
            <div class="relative">
              <Field
                name="otp"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                placeholder="••••••"
                class="w-full tracking-[0.6em] text-center text-lg px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
              />
            </div>
            <ErrorMessage name="otp" class="text-sm text-red-500" />
          </div>

          <!-- Timer -->
          <div
            class="flex items-center justify-center gap-2 text-sm text-gray-600"
          >
            <span aria-hidden="true">⏱</span>
            <span>Hiệu lực mã: {{ formatTime(timer) }}</span>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              type="button"
              @click="currentStep = 1"
              class="flex items-center justify-center w-full gap-2 px-4 py-3 text-gray-700 transition border border-gray-200 rounded-2xl hover:bg-gray-50"
            >
              <span aria-hidden="true">←</span>
              Quay lại
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full px-4 py-3 font-medium text-white transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl hover:from-pink-600 hover:to-purple-700 focus:ring-4 focus:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác minh & Đăng ký
            </button>
          </div>

          <button
            type="button"
            class="w-full px-4 py-3 text-gray-700 transition border border-gray-200 rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isResending || resendCooldown > 0"
            @click="resendOTP"
          >
            {{
              isResending
                ? "Đang gửi..."
                : resendCooldown > 0
                ? `Gửi lại mã sau ${resendCooldown}s`
                : "Gửi lại mã"
            }}
          </button>
        </Form>

        <!-- Step 3: Thành công -->
        <div v-if="currentStep === 3" class="space-y-4 text-center">
          <div
            class="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-50 ring-8 ring-green-100"
          >
            <span class="text-3xl font-bold text-green-600" aria-hidden="true"
              >✓</span
            >
          </div>
          <h2 class="text-xl font-semibold text-gray-800">
            Đăng ký thành công!
          </h2>
          <p class="text-gray-600">
            Tài khoản của bạn đã được xác minh và tạo mới.
          </p>
          <button
            class="w-full px-4 py-3 font-medium text-white transition bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl hover:from-pink-600 hover:to-purple-700 focus:ring-4 focus:ring-pink-200"
            @click="redirectToLogin"
          >
            Đi đến đăng nhập
          </button>
        </div>

        <!-- Error -->
        <div
          v-if="message"
          class="p-4 mt-4 border border-red-200 bg-red-50 rounded-2xl"
        >
          <p class="text-sm text-red-700">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { ref, onBeforeUnmount } from "vue";
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import {
  registerApi,
  sendOTPApi,
  resendOTPApi,
} from "../../service/auth.service";

const schema = yup.object({
  name: yup
    .string()
    .required("Username is required!")
    .min(3, "Must be at lease 3 characters!")
    .max(20, "Must be maximum 20 characters!"),
  email: yup
    .string()
    .required("Email is required!")
    .matches(/@gmail\.com$/, "Please use a Gmail address")
    .email("Email is Invalid!")
    .max(50, "Must be maximum 50 character!"),
  password: yup
    .string()
    .required("Password is required!")
    .min(6, "Must be at lease 6 characters!")
    .max(12, "Must be maximum 12 characters!"),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .required("Verification code is required")
    .matches(/^[0-9]{6}$/, "Must be a 6-digit number"),
});

export default {
  name: "RegisterForm",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  setup() {
    const router = useRouter();

    const message = ref("");
    const successful = ref(false);
    const isLoading = ref(false);
    const isResending = ref(false);

    const currentStep = ref(1);
    const timer = ref(300); // 5 phút
    const resendCooldown = ref(0);

    const userInfo = ref({
      name: "",
      email: "",
      password: "",
    });

    const showPassword = ref(false);

    let timerInterval = null;
    let cooldownInterval = null;

    // Bắt đầu đếm ngược hiệu lực OTP
    const startTimer = () => {
      clearInterval(timerInterval);
      timer.value = 300;
      timerInterval = setInterval(() => {
        if (timer.value > 0) {
          timer.value--;
        } else {
          clearInterval(timerInterval);
          message.value = "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.";
        }
      }, 1000);
    };

    // Cooldown gửi lại OTP
    const startResendCooldown = () => {
      clearInterval(cooldownInterval);
      resendCooldown.value = 60;
      cooldownInterval = setInterval(() => {
        if (resendCooldown.value > 0) {
          resendCooldown.value--;
        } else {
          clearInterval(cooldownInterval);
        }
      }, 1000);
    };
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const requestOTP = async (user) => {
      message.value = "";
      isLoading.value = true;
      try {
        userInfo.value = {
          name: (user.name || "").trim(),
          email: (user.email || "").trim(),
          password: user.password || "",
        };

        const response = await sendOTPApi({ email: userInfo.value.email });
        if (response.data && response.data.success) {
          currentStep.value = 2;
          startTimer();
        } else {
          message.value =
            (response.data && response.data.message) ||
            "Gửi mã xác thực thất bại.";
        }
      } catch (error) {
        message.value =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      } finally {
        isLoading.value = false;
      }
    };

    const resendOTP = async () => {
      if (resendCooldown.value > 0) return;

      message.value = "";
      isResending.value = true;
      try {
        const response = await resendOTPApi({ email: userInfo.value.email });
        if (response.data && response.data.success) {
          startTimer();
          startResendCooldown();
          message.value = "Đã gửi lại mã xác thực mới.";
        } else {
          message.value =
            (response.data && response.data.message) ||
            "Gửi lại mã xác thực thất bại.";
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.remainingTime
        ) {
          resendCooldown.value = error.response.data.remainingTime;
          startResendCooldown();
        }
        message.value =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      } finally {
        isResending.value = false;
      }
    };

    const verifyAndRegister = async (data) => {
      message.value = "";
      isLoading.value = true;
      try {
        const response = await registerApi({
          name: userInfo.value.name,
          email: userInfo.value.email,
          password: userInfo.value.password,
          otp: data.otp,
        });
        if (response.data) {
          clearInterval(timerInterval);
          successful.value = true;
          currentStep.value = 3;
          message.value = "";
        } else {
          message.value =
            (response.data && response.data.message) || "Đăng ký thất bại.";
        }
      } catch (error) {
        message.value =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
      } finally {
        isLoading.value = false;
      }
    };

    const redirectToLogin = () => {
      router.push({ path: "/Login-Page" });
    };

    onBeforeUnmount(() => {
      clearInterval(timerInterval);
      clearInterval(cooldownInterval);
    });

    return {
      router,
      message,
      successful,
      isLoading,
      isResending,
      currentStep,
      timer,
      resendCooldown,
      userInfo,
      showPassword,
      schema,
      otpSchema,
      requestOTP,
      verifyAndRegister,
      resendOTP,
      formatTime,
      redirectToLogin,
    };
  },
};
</script>

<style scoped>
/* Subtle entrance animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
:deep(.v-enter-active),
:deep(.v-leave-active) {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
:deep(.v-enter-from),
:deep(.v-leave-to) {
  opacity: 0;
  transform: translateY(6px);
}
input:focus {
  outline: none;
}
/* Glassmorphism enhancement */
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}
</style>
