import Swal from 'sweetalert2';

const defaultConfig = {
  customClass: {
    popup: 'rounded-2xl shadow-2xl',
    title: 'text-xl font-semibold text-gray-700',
    confirmButton: 'px-6 py-3 rounded-lg font-semibold',
    cancelButton: 'px-6 py-3 rounded-lg font-semibold',
  },
  background: '#ffffff',
  backdrop: 'rgba(0,0,0,0.3)',
}

export const showLoadingAlert = (title = 'Loading', message = 'Vui lòng chờ trong giây lát...') => {
  Swal.fire({
    ...defaultConfig,
    title,
    html: `
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 mb-4 border-b-2 rounded-full animate-spin border-rose-400"></div>
        <p class="text-gray-600">${message}</p>
      </div>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
  })
}

export const showSuccessAlert = (
  title = 'Success!', 
  message = 'Thao tác đã được thực hiện thành công!',
  timer = 3000
) => {
  Swal.fire({
    ...defaultConfig,
    title,
    html: `
      <div class="flex flex-col items-center">
        <div class="relative mb-4">
          <div class="flex items-center justify-center w-16 h-16 border rounded-full bg-emerald-50 border-emerald-200">
            <span class="text-2xl text-emerald-600">✓</span>
          </div>
        </div>
        <p class="text-sm text-gray-600">${message}</p>
      </div>
    `,
    confirmButtonText: 'Tuyệt vời!',
    confirmButtonColor: '#f43f5e',
    target: document.body,
    timer,
    timerProgressBar: true,
  })
}

export const showErrorAlert = (
  title = 'Oops!', 
  message = 'Có lỗi xảy ra, vui lòng thử lại',
  timer = 5000
) => {
  Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Thử lại',
    target: document.body,
    customClass: {
      ...defaultConfig.customClass,
      title: 'text-xl font-semibold text-red-600',
    },
    timer,
    timerProgressBar: true,
  })
}

export const showWarningAlert = (
  title = 'Cảnh báo!', 
  message = 'Vui lòng kiểm tra lại thông tin'
) => {
  Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'Đã hiểu',
    target: document.body,
    customClass: {
      ...defaultConfig.customClass,
      title: 'text-xl font-semibold text-amber-600',
    },
  })
}

export const showConfirmAlert = (
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ'
) => {
  return Swal.fire({
    ...defaultConfig,
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#f43f5e',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  }).then((result) => result.isConfirmed)
}

export const showDeleteConfirmAlert = (
  itemName = 'mục này',
  confirmText = 'Xóa ngay'
) => {
  return Swal.fire({
    ...defaultConfig,
    title: 'Xác nhận xóa',
    html: `
      <div class="flex flex-col items-center">
        <div class="flex items-center justify-center w-16 h-16 mb-4 border rounded-full bg-red-50 border-red-200">
          <span class="text-2xl text-red-600">🗑️</span>
        </div>
        <p class="text-gray-600">Bạn có chắc chắn muốn xóa <strong>${itemName}</strong>?</p>
        <p class="mt-2 text-sm text-red-500">Hành động này không thể hoàn tác!</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true,
    customClass: {
      ...defaultConfig.customClass,
      title: 'text-xl font-semibold text-red-600',
    },
  }).then((result) => result.isConfirmed)
}

export const showInfoAlert = (
  title = 'Thông tin', 
  message = 'Thông tin hữu ích cho bạn'
) => {
  Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title,
    text: message,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'Đã hiểu',
    customClass: {
      ...defaultConfig.customClass,
      title: 'text-xl font-semibold text-blue-600',
    },
  })
}

export const showAvatarUploadingAlert = (message = 'Đang xử lý ảnh đại diện của bạn...') => {
  Swal.fire({
    ...defaultConfig,
    title: 'Đang tải ảnh lên',
    html: `
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 mb-4 border-b-2 rounded-full animate-spin border-rose-400"></div>
        <p class="text-gray-600">${message}</p>
      </div>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
  })
}

export const showAvatarSuccessAlert = (
  newAvatarUrl, 
  message = 'Ảnh đại diện của bạn đã được cập nhật!'
) => {
  Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title: 'Cập nhật ảnh đại diện thành công!',
    html: `
      <div class="flex flex-col items-center">
        <div class="relative mb-4">
          <img src="${newAvatarUrl}" 
               alt="New Avatar" 
               class="w-24 h-24 border-4 rounded-full shadow-lg border-rose-200">
          <div class="absolute flex items-center justify-center w-8 h-8 rounded-full -top-2 -right-2 bg-emerald-500">
            <span class="text-sm text-white">✓</span>
          </div>
        </div>
        <p class="text-sm text-gray-600">${message}</p>
      </div>
    `,
    confirmButtonText: 'Tuyệt vời!',
    confirmButtonColor: '#f43f5e',
    timer: 4000,
    timerProgressBar: true,
  })
}
export const showInputAlert = (
  title = 'Nhập thông tin',
  inputLabel = 'Vui lòng nhập:',
  inputType = 'text',
  placeholder = '',
  validator = null
) => {
  return Swal.fire({
    ...defaultConfig,
    title,
    html: `
      <div class="text-left">
        <label class="block mb-2 text-sm font-medium text-gray-600">${inputLabel}</label>
        <input 
          id="swal-input" 
          type="${inputType}" 
          placeholder="${placeholder}"
          class="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
        >
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: '#f43f5e',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy bỏ',
    preConfirm: () => {
      const value = document.getElementById('swal-input').value
      if (validator && typeof validator === 'function') {
        const validationResult = validator(value)
        if (validationResult !== true) {
          Swal.showValidationMessage(validationResult)
          return false
        }
      }
      return value
    }
  }).then((result) => {
    return result.isConfirmed ? result.value : null
  })
}
export const closeAlert = () => {
  Swal.close()
}
export const isAlertOpen = () => {
  return Swal.isVisible()
}
export default {
  showLoadingAlert,
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showInfoAlert,
  showConfirmAlert,
  showDeleteConfirmAlert,
  showAvatarUploadingAlert,
  showAvatarSuccessAlert,
  showInputAlert,
  closeAlert,
  isAlertOpen
}