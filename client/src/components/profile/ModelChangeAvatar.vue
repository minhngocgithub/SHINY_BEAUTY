<script setup>
import { ref, computed } from "vue";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";
import { uploadAvatar } from "../../service/auth.service";
import { 
  showErrorAlert, 
  showSuccessAlert,
  closeAlert 
} from '../../../utils/sweetAlert'
import { useAuthStore } from "../../store/auth.store";

// Store
const authStore = useAuthStore();

// Props and emits first
const props = defineProps({
  currentAvatar: {
    type: Object,
    default: () => ({ url: "", public_id: "" }),
  },
});

const emit = defineEmits(["update:avatar", "loading-state"]);

// Reactive state
const showCropper = ref(false);
const imageUrl = ref("");
const cropper = ref(null);
const isLoading = ref(false);
const imageLoaded = ref(false);

// Computed properties
const avatarUrl = computed(() => {
  if (props.currentAvatar?.url) {
    return props.currentAvatar.url;
  }
  return "/placeholder.svg?height=100&width=100&text=Avatar";
});

// Methods
const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showErrorAlert('File không hợp lệ', 'Vui lòng chọn file ảnh hợp lệ');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showErrorAlert('File quá lớn', 'Kích thước file phải nhỏ hơn 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    imageUrl.value = e.target.result;
    imageLoaded.value = false;
    showCropper.value = true;
  };
  reader.readAsDataURL(file);
};

const handleImageReady = () => {
  imageLoaded.value = true;
};

const handleCrop = async () => {
  if (!cropper.value || !imageLoaded.value) {
    console.error("Cropper not ready");
    return;
  }

  isLoading.value = true;
  emit("loading-state", true);

  try {
    const canvas = cropper.value.getCroppedCanvas({
      width: 300,
      height: 300,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!canvas) {
      console.error("Failed to get cropped canvas");
      isLoading.value = false;
      emit("loading-state", false);
      showErrorAlert("Lỗi xử lý ảnh", "Không thể xử lý ảnh");
      return;
    }

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error("Failed to create blob");
          isLoading.value = false;
          emit("loading-state", false);
          showErrorAlert("Lỗi xử lý ảnh", "Không thể xử lý ảnh");
          return;
        }

        const file = new File([blob], "avatar.png", { type: "image/png" });
        const formData = new FormData();
        formData.append("avatar", file);

        try {
          const res = await uploadAvatar(formData);
          console.log("Upload response:", res);
          
          if (res.data && res.data.success) {
            if (res.data.avatar && res.data.avatar.url) {
              emit("update:avatar", res.data.avatar.url);

              const currentState = authStore.state;
              if (currentState.user) {
                const updatedUser = { ...currentState.user };
                updatedUser.avatar = res.data.avatar;

                authStore.setAuthStore({
                  ...currentState,
                  user: updatedUser,
                });
              }

              showSuccessAlert("Thành công!", "Ảnh đại diện đã được cập nhật thành công!");
              showCropper.value = false;
            } else {
              showErrorAlert("Tải ảnh thành công", "Tải ảnh lên thành công nhưng không nhận được URL ảnh");
            }
          } else {
            showErrorAlert("Tải ảnh thất bại", res.data?.message || "Tải ảnh lên thất bại");
          }
        } catch (err) {
          console.error("Error uploading avatar:", err, err?.response);
          showErrorAlert("Lỗi mạng", "Lỗi mạng. Vui lòng kiểm tra kết nối internet.");
        } finally {
          isLoading.value = false;
          emit("loading-state", false);
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = "";
        }
      },
      "image/png",
      0.9
    );
  } catch (error) {
    console.error("Error during crop:", error);
    isLoading.value = false;
    emit("loading-state", false);
    showErrorAlert("Lỗi xử lý ảnh", "Lỗi xử lý ảnh. Vui lòng thử lại.");
  }
};

const handleCancel = () => {
  showCropper.value = false;
  imageLoaded.value = false;
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) fileInput.value = "";
};
</script>

<template>
  <div class="relative mx-auto sm:mx-0">
    <img 
      :src="avatarUrl" 
      alt="avatar"
      class="object-cover w-24 h-24 border-4 border-white rounded-full shadow-lg"
    />
    <label
      class="absolute flex items-center justify-center w-8 h-8 text-sm text-white transition-transform rounded-full shadow-md cursor-pointer -bottom-1 -right-1 bg-gradient-to-r from-rose-400 to-violet-400 hover:scale-110"
      :class="isLoading ? 'pointer-events-none' : ''"
    >
      <input
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
        :disabled="isLoading"
      />
      <span v-if="!isLoading">✎</span>
      <div
        v-else
        class="w-4 h-4 border-b-2 border-white rounded-full animate-spin"
      ></div>
    </label>

    <!-- Fixed z-index hierarchy and removed checkered pattern -->
    <Teleport to="body">
      <div
        v-if="showCropper"
        class="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        style="z-index: 10000;"
        @click.self="handleCancel"
      >
        <div
          class="bg-white p-6 rounded-3xl w-full max-w-[500px] max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 border border-gray-100"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-700">Cắt ảnh đại diện</h3>
            <button
              @click="handleCancel"
              class="text-2xl leading-none text-gray-400 hover:text-gray-600"
              :disabled="isLoading"
            >
              ×
            </button>
          </div>
          
          <div class="mb-6 cropper-wrapper">
            <!-- Removed checkered background and improved container styling -->
            <div class="overflow-hidden rounded-lg cropper-container bg-gradient-to-br from-gray-100 to-gray-200" style="height: 350px;">
              <VueCropper
                ref="cropper"
                :src="imageUrl"
                :auto-crop="true"
                :fixed-box="true"
                :center-box="true"
                :info="true"
                :full="true"
                :can-scale="false"
                :fixed="true"
                :fixed-number="[1, 1]"
                output-type="png"
                @ready="handleImageReady"
                style="height: 100%; width: 100%;"
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              @click="handleCancel"
              class="px-6 py-3 font-medium text-gray-600 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200"
              :disabled="isLoading"
            >
              Hủy
            </button>
            <button
              @click="handleCrop"
              :disabled="isLoading || !imageLoaded"
              class="px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500 disabled:opacity-50"
            >
              {{ isLoading ? "Đang xử lý..." : "Lưu ảnh đại diện" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.cropper-wrapper {
  position: relative;
}

.cropper-container {
  position: relative;
  height: 350px;
  /* Removed checkered background pattern */
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Ensure cropper displays properly */
:deep(.cropper-container) {
  height: 350px !important;
  /* Override default checkered background */
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
}

:deep(.cropper-canvas) {
  max-height: 100% !important;
  max-width: 100% !important;
}

:deep(.cropper-drag-box) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.cropper-view-box) {
  border: 2px solid #f43f5e;
  border-radius: 50%;
}

:deep(.cropper-face) {
  background-color: transparent;
}

/* Remove any checkered patterns from cropper */
:deep(.cropper-bg) {
  background-image: none !important;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.hover\:scale-110:hover {
  transform: scale(1.10);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
