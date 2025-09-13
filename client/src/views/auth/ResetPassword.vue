<template>
  <div class="min-h-screen flex flex-col">
    <Loading v-if="isLoading" class="loading-component spinner-border spinner-border-sm"></Loading>
    <div :class="{'blur': isLoading}" class="content-wrapper mt-4 mb-40 grow flex items-center justify-around">
      <div class="container">
        <h1 class="text-4xl text-center mb-4 font-serif mt-4 bg-gradient-to-r from-[#ff00ff80] to-[#00ddff] bg-clip-text text-transparent animate-textclip">
          Reset Password
        </h1>

        <div 
          v-if="tokenExpired" 
          class="alert mt-4 text-center p-3 rounded max-w-md mx-auto bg-red-100 text-red-700"
        >
          Password reset link has expired or is invalid. Please request a new one.
          <div class="mt-3">
            <router-link to="/forgot-password" class="underline tracking-tight hover:text-sky-500/75 font-bold">
              Back to Forgot Password
            </router-link>
          </div>
        </div>

        <Form 
          v-else
          action="" 
          class="max-w-md mx-auto border rounded-lg p-6" 
          @submit="handleResetPassword" 
          :validation-schema="schema"
        >
          <div class="form-group mb-4">
            <Field 
              name="password" 
              type="password" 
              class="form-control w-full p-2 border rounded" 
              placeholder="Enter new password" 
            />
            <ErrorMessage name="password" class="error-feedback text-red-500 text-sm mt-1" />
          </div>
          
          <div class="form-group mb-4">
            <Field 
              name="confirmPassword" 
              type="password" 
              class="form-control w-full p-2 border rounded" 
              placeholder="Confirm new password" 
            />
            <ErrorMessage name="confirmPassword" class="error-feedback text-red-500 text-sm mt-1" />
          </div>
          
          <div class="form-group mt-4">
            <button 
              class="primary w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded hover:opacity-90 transition-opacity" 
              :disabled="isLoading"
            >
              Reset Password
            </button>
          </div>
        </Form>

        <div 
          v-if="message" 
          class="alert mt-4 text-center p-3 rounded max-w-md mx-auto" 
          :class="isSuccess ? 'alert-success bg-green-100 text-green-700' : 'alert-danger bg-red-100 text-red-700'"
        >
          {{ message }}
          <div v-if="isSuccess" class="mt-3">
            <router-link to="/Login-page" class="underline tracking-tight hover:text-sky-500/75 font-bold">
              Back to Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import Loading from '../../components/Loading.vue';
import { resetPasswordApi } from '../../service/auth.service'
const schema = yup.object({
  password: yup
    .string()
    .required("New password is required!")
    .min(5, "Must be at least 5 characters!")
    .max(12, "Must be maximum 12 characters!"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password!")
    .oneOf([yup.ref('password')], "Passwords must match!")
});

export default {
  name: "ResetPassword",
  components: {
    Form,
    Field,
    ErrorMessage,
    Loading
  },
  setup() {
    const route = useRouter();
    const token = ref('');
    const isLoading = ref(false);
    const message = ref('');
    const isSuccess = ref(false);
    const tokenExpired = ref(false);
    
    onMounted(() => {
      // Extract token from URL
      token.value = route.params.token;
      
      // Validate token on component mount
      validateToken();
    });
    
    const validateToken = async () => {
      if (!token.value) {
        tokenExpired.value = true;
        return;
      }   
      isLoading.value = true; 
      try {       
      } catch (error) {
        tokenExpired.value = true;
        isLoading.value = false;
      }
    };
    
    const handleResetPassword = async (values) => {
      message.value = '';
      isLoading.value = true;
      
      try {
        // Make API request to reset password
        const response = await resetPasswordApi({
          token: token.value,
          password: values.password
        });
        
        isSuccess.value = true;
        message.value = "Your password has been reset successfully!";
      } catch (error) {
        isSuccess.value = false;
        
        if (error.response && error.response.status === 400) {
          tokenExpired.value = true;
          message.value = "Password reset link has expired or is invalid.";
        } else {
          message.value = (error.response && error.response.data && error.response.data.message) || 
                          "Failed to reset password. Please try again later.";
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      isLoading,
      message,
      isSuccess,
      tokenExpired,
      schema,
      handleResetPassword
    };
  }
};
</script>