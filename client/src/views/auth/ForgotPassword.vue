<template>
  <div class="min-h-screen flex flex-col">
    <Loading v-if="isLoading" class="loading-component spinner-border spinner-border-sm"></Loading>
    <div :class="{'blur': isLoading}" class="content-wrapper mt-4 mb-40 grow flex items-center justify-around">
      <div class="container">
        <h1 class="text-4xl text-center mb-4 font-serif mt-4 bg-gradient-to-r from-[#ff00ff80] to-[#00ddff] bg-clip-text text-transparent animate-textclip">
          Forgot Password
        </h1>
        <Form 
          action="" 
          class="max-w-md mx-auto border rounded-lg" 
          @submit="handleForgotPassword" 
          :validation-schema="schema"
        >
          <div class="form-group">
            <Field 
              name="email" 
              type="email" 
              class="form-control" 
              placeholder="your@gmail.com" 
            />
            <ErrorMessage name="email" class="error-feedback" />
          </div>
          
          <div class="form-group mt-4">
            <button class="primary" :disabled="isLoading">
              Send Reset Password
            </button>
          </div>
          
          <div class="form-group">
            <div class="text-center py-3">
              <router-link to="/Login-page" class="underline tracking-tight hover:text-sky-500/75 font-bold">
                Back to Login
              </router-link>
            </div>
          </div>
        </Form>
        
        <div v-if="message" class="alert mt-4 text-center p-3 rounded" :class="isSuccess ? 'alert-success bg-green-100 text-green-700' : 'alert-danger bg-red-100 text-red-700'">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import Loading from '../../components/Loading.vue';
import { forgotPasswordApi } from '../../service/auth.service'
const schema = yup.object({
  email: yup
    .string()
    .required("Email is required!")
    .email("Email is Invalid!")
    .max(50, "Must be maximum 50 characters!")
});

export default {
  name: "ForgotPassword",
  components: {
    Form,
    Field,
    ErrorMessage,
    Loading
  },
  setup() {
    const isLoading = ref(false);
    const message = ref("");
    const isSuccess = ref(false);

    const handleForgotPassword = async (values) => {
      message.value = "";
      isLoading.value = true;
      
      try {
        // Simulate some loading time to match your login behavior
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Make API request to your backend forgot password endpoint
        const response = await forgotPasswordApi({ email: values.email });
        
        isSuccess.value = true;
        message.value = "Password reset email has been sent to your email address. Please check your inbox.";
      } catch (error) {
        isSuccess.value = false;
        message.value = (error.response && error.response.data && error.response.data.message) || 
                        "Failed to send password reset email. Please try again later.";
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isLoading,
      message,
      isSuccess,
      schema,
      handleForgotPassword,
    };
  }
};
</script>
<style scoped>

</style>