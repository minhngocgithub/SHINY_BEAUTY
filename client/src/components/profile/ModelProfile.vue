<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
    <!-- Loading Overlay -->
    <div v-if="isLoading || isAvatarLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div class="p-6 bg-white shadow-2xl rounded-2xl">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 border-b-2 rounded-full animate-spin border-rose-400"></div>
          <span class="font-medium text-gray-700">
            {{ isAvatarLoading ? 'Đang tải ảnh lên...' : 'Đang xử lý...' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Button -->
    <button
      @click="isMobileMenuOpen = !isMobileMenuOpen"
      class="fixed z-50 p-3 border border-gray-100 shadow-lg top-4 left-4 lg:hidden bg-white/90 backdrop-blur-xl rounded-2xl"
    >
      <div class="space-y-1">
        <span :class="['block w-5 h-0.5 bg-gray-600 transition-all duration-300', isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '']"></span>
        <span :class="['block w-5 h-0.5 bg-gray-600 transition-all duration-300', isMobileMenuOpen ? 'opacity-0' : '']"></span>
        <span :class="['block w-5 h-0.5 bg-gray-600 transition-all duration-300', isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : '']"></span>
      </div>
    </button>

    <!-- Mobile Overlay -->
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"></div>

    <div class="flex">
      <!-- Sidebar -->
      <aside :class="[
        'fixed lg:static inset-y-0 left-0 z-40 w-80 transform transition-all duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]">
        <div class="h-full border-r border-gray-100 shadow-xl bg-white/90 backdrop-blur-xl">
          <!-- Header -->
          <div class="p-6 border-b border-gray-100">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-transparent bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text">
                Queen's Beauty
              </h1>
              <p class="mt-1 text-sm text-gray-500">Cosmetic Store</p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 p-6">
            <ul class="space-y-2">
              <li v-for="item in menuItems" :key="item.id">
                <button
                  @click="activeTab = item.id; isMobileMenuOpen = false"
                  :class="[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-rose-100 to-violet-100 text-rose-700 shadow-sm border border-rose-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                  ]"
                >
                  <span class="font-medium">{{ item.label }}</span>
                </button>
              </li>
            </ul>
          </nav>

          <!-- Logout -->
          <div class="p-6 border-t border-gray-100">
            <button
              @click="logout"
              class="flex items-center w-full gap-3 px-4 py-3 text-red-500 transition-all duration-200 hover:bg-red-50 rounded-xl"
            >
              <span class="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 lg:p-8">
        <div class="max-w-4xl mx-auto">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="space-y-6">
            <!-- Profile Header Card -->
            <div class="overflow-hidden border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
              <div class="relative h-32 bg-gradient-to-r from-rose-200 via-violet-200 to-blue-200">
                <div class="absolute inset-0 bg-white/20"></div>
              </div>
              <div class="relative p-6 sm:-mt-16">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <!-- Integrated ModelChangeAvatar component -->
                  <ModelChangeAvatar 
                    :currentAvatar="authStore.user?.avatar || { url: '', public_id: '' }"
                    @update:avatar="handleAvatarUpdate"
                    @loading-state="handleAvatarLoadingState"
                  />
                  <div class="flex-1 text-center sm:text-left">
                    <h1 class="text-2xl font-bold text-gray-700">{{ authStore.user?.name }}</h1>
                    <p class="text-gray-500">{{ authStore.user?.email }}</p>
                    <div class="flex justify-center gap-2 mt-2 sm:justify-start">
                      <span class="px-3 py-1 text-sm border rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">Thành viên</span>
                      <span v-if="authStore.user?.isAdmin" class="px-3 py-1 text-sm border rounded-full bg-violet-50 text-violet-700 border-violet-200">Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-700">Thông tin cá nhân</h2>
                <button
                  @click="isEditing = !isEditing"
                  :class="[
                    'px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm',
                    isEditing 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200' 
                      : 'bg-gradient-to-r from-rose-400 to-violet-400 hover:from-rose-500 hover:to-violet-500 text-white'
                  ]"
                >
                  {{ isEditing ? 'Hủy' : 'Chỉnh sửa' }}
                </button>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Họ và tên</label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.name"
                    type="text"
                    class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  />
                  <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
                    {{ authStore.user?.name }}
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Email</label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.email"
                    type="email"
                    class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  />
                  <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
                    {{ authStore.user?.email }}
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.phone"
                    type="tel"
                    class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  />
                  <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
                    {{ authStore.user?.phone || 'Chưa cập nhật' }}
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-600">Ngày sinh</label>
                  <input
                    v-if="isEditing"
                    v-model="editForm.birthDate"
                    type="date"
                    class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
                  />
                  <div v-else class="px-4 py-3 text-gray-700 border border-gray-100 bg-gray-50 rounded-xl">
                    {{ authStore.user?.birthDate || 'Chưa cập nhật' }}
                  </div>
                </div>
              </div>

              <div v-if="isEditing" class="flex gap-3 mt-6">
                <button
                  @click="updateProfile"
                  :disabled="isLoading"
                  class="flex-1 px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500 disabled:opacity-50"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>

          <!-- Orders Tab -->
          <div v-if="activeTab === 'orders'" class="space-y-6">
            <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
              <h2 class="mb-6 text-xl font-semibold text-gray-700">Lịch sử đơn hàng</h2>
              <div class="space-y-4">
                <div v-for="order in mockOrders" :key="order.id" class="p-4 transition-shadow bg-white border border-gray-100 rounded-xl hover:shadow-md">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="font-semibold text-gray-700">Đơn hàng #{{ order.id }}</h3>
                      <p class="text-sm text-gray-500">{{ order.date }}</p>
                    </div>
                    <span :class="[
                      'px-3 py-1 rounded-full text-sm font-medium border',
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    ]">
                      {{ order.statusText }}
                    </span>
                  </div>
                  <div class="mb-2 text-gray-600">{{ order.items }}</div>
                  <div class="text-lg font-semibold text-rose-600">{{ order.total }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="space-y-6">
            <!-- Password Change -->
            <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
              <div class="flex items-center gap-3 mb-6">
                <span class="text-2xl">🔒</span>
                <h2 class="text-xl font-semibold text-gray-700">Đổi mật khẩu</h2>
              </div>
              <button
                @click="showPasswordModal = true"
                class="px-6 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl hover:from-blue-500 hover:to-indigo-500"
              >
                Thay đổi mật khẩu
              </button>
            </div>

            <!-- Notifications -->
            <div class="p-6 border border-gray-100 shadow-lg bg-white/90 backdrop-blur-xl rounded-3xl">
              <div class="flex items-center gap-3 mb-6">
                <span class="text-2xl">🔔</span>
                <h2 class="text-xl font-semibold text-gray-700">Thông báo</h2>
              </div>
              <div class="space-y-4">
                <label class="flex items-center justify-between cursor-pointer">
                  <div>
                    <span class="font-medium text-gray-700">Email thông báo</span>
                    <p class="text-sm text-gray-500">Nhận thông báo về đơn hàng và khuyến mãi</p>
                  </div>
                  <div class="relative">
                    <input type="checkbox" class="sr-only peer" v-model="settings.emailNotifications" />
                    <div class="w-12 h-6 transition-all duration-200 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-rose-300 peer-checked:to-violet-300"></div>
                    <div class="absolute w-4 h-4 transition-all duration-200 bg-white rounded-full shadow-md left-1 top-1 peer-checked:translate-x-6"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="w-full max-w-md p-6 bg-white border border-gray-100 shadow-2xl rounded-3xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-700">Đổi mật khẩu</h3>
          <button @click="showPasswordModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">×</span>
          </button>
        </div>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-600">Mật khẩu hiện tại</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              required
            />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-600">Mật khẩu mới</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              required
            />
          </div>
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-600">Xác nhận mật khẩu mới</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              required
            />
          </div>
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="flex-1 px-4 py-3 font-medium text-gray-600 transition-all duration-200 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 px-4 py-3 font-medium text-white transition-all duration-200 shadow-sm bg-gradient-to-r from-rose-400 to-violet-400 rounded-xl hover:from-rose-500 hover:to-violet-500 disabled:opacity-50"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth.store'
import { updateUserProfile, logoutAccountApi } from '../../service/auth.service'
import ModelChangeAvatar from '../profile/ModelChangeAvatar.vue'
import { 
  showLoadingAlert, 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmAlert,
  closeAlert 
} from '../../../utils/sweetAlert'

export default {
  name: 'ModelProfile',
  components: {
    ModelChangeAvatar
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isLoading = ref(false)
    const isMobileMenuOpen = ref(false)
    const activeTab = ref('profile')
    const isEditing = ref(false)
    const showPasswordModal = ref(false)
    const isAvatarLoading = ref(false)

    const editForm = ref({
      name: '',
      email: '',
      phone: '',
      birthDate: ''
    })

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const settings = ref({
      emailNotifications: true
    })

    const menuItems = ref([
      { id: 'profile', label: 'Hồ sơ', icon: '👤' },
      { id: 'orders', label: 'Đơn hàng', icon: '📦' },
      { id: 'settings', label: 'Cài đặt', icon: '⚙️' }
    ])

    const mockOrders = ref([
      {
        id: '001',
        date: '2024-01-15',
        items: 'Son môi Dior, Kem nền Chanel',
        total: '2,500,000₫',
        status: 'completed',
        statusText: 'Hoàn thành'
      },
      {
        id: '002',
        date: '2024-01-10',
        items: 'Mascara YSL, Phấn phủ MAC',
        total: '1,800,000₫',
        status: 'shipping',
        statusText: 'Đang giao'
      }
    ])

    const handleAvatarUpdate = (newAvatarUrl) => {
      // Update auth store with new avatar
      const currentState = authStore.state
      if (currentState.user) {
        const updatedUser = { ...currentState.user }
        updatedUser.avatar = { url: newAvatarUrl }
        window.location.reload()
        authStore.setAuthStore({
          ...currentState,
          user: updatedUser,
        })
      }
    }

    const handleAvatarLoadingState = (loading) => {
      isAvatarLoading.value = loading
    }

    const updateProfile = async () => {
      if (!editForm.value.name || !editForm.value.email) {
        showErrorAlert('Lỗi validation', 'Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }

      isLoading.value = true
      showLoadingAlert('Đang cập nhật thông tin', 'Vui lòng chờ trong giây lát...')

      try {
        const response = await updateUserProfile(editForm.value)
        if (response.success) {
          authStore.setAuthStore({
            ...authStore.state,
            user: { ...authStore.state.user, ...editForm.value }
          })
          isEditing.value = false
          closeAlert()
          showSuccessAlert('Thành công!', 'Thông tin cá nhân đã được cập nhật thành công!')
          window.location.reload()
        } else {
          closeAlert()
          showErrorAlert('Cập nhật thất bại', response.message || 'Cập nhật thông tin thất bại')
        }
      } catch (error) {
        console.error('Update profile error:', error)
        closeAlert()
        showErrorAlert('Lỗi hệ thống', 'Có lỗi xảy ra khi cập nhật thông tin')
      } finally {
        isLoading.value = false
      }
    }

    const changePassword = async () => {
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        showErrorAlert('Lỗi validation', 'Mật khẩu xác nhận không khớp')
        return
      }

      if (passwordForm.value.newPassword.length < 6) {
        showErrorAlert('Lỗi validation', 'Mật khẩu mới phải có ít nhất 6 ký tự')
        return
      }

      isLoading.value = true
      showLoadingAlert('Đang đổi mật khẩu', 'Vui lòng chờ trong giây lát...')

      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        closeAlert()
        showSuccessAlert('Thành công!', 'Mật khẩu đã được thay đổi thành công!')
        showPasswordModal.value = false
        passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      } catch (error) {
        console.error('Change password error:', error)
        closeAlert()
        showErrorAlert('Lỗi hệ thống', 'Có lỗi xảy ra khi đổi mật khẩu')
      } finally {
        isLoading.value = false
      }
    }

    const logout = async () => {
      const confirmed = await showConfirmAlert(
        'Xác nhận đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
        'Đăng xuất',
        'Hủy'
      )

      if (confirmed) {
        try {
          await logoutAccountApi()
          authStore.setAuthStore({ user: null, isLoggedIn: false })
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('newRefreshToken')
          router.push('/Login-Page')
        } catch (error) {
          console.error('Logout error:', error)
          router.push('/Login-Page')
        }
      }
    }

    onMounted(() => {
      if (!authStore.state.isLoggedIn) {
        authStore.loadFromStorage()
      }
      
      if (authStore.state.user) {
        editForm.value = {
          name: authStore.state.user.name || '',
          email: authStore.state.user.email || '',
          phone: authStore.state.user.phone || '',
          birthDate: authStore.state.user.birthDate || ''
        }
      }
    })

    return {
      isLoading,
      isAvatarLoading,
      isMobileMenuOpen,
      activeTab,
      isEditing,
      showPasswordModal,
      editForm,
      passwordForm,
      settings,
      menuItems,
      mockOrders,
      authStore: authStore.state,
      updateProfile,
      changePassword,
      handleAvatarUpdate,
      handleAvatarLoadingState,
      logout
    }
  }
}
</script>

<style scoped>
/* Glassmorphism effect */
.backdrop-blur-xl {
  backdrop-filter: blur(16px);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fb7185, #a78bfa);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #f43f5e, #8b5cf6);
}
</style>
