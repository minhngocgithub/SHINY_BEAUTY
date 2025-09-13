// convert file to base64
export const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      // Read file content on file loaded event
      reader.onload = (event) => {
        resolve(event.target.result)
      }
      // Convert data to base64
      reader.readAsDataURL(file)
    })
}
export const validateImageFile = (file) => {
  const errors = []
  
  // Check if file exists
  if (!file) {
    errors.push('Please select an image')
    return errors
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errors.push('Please upload a valid image file (JPEG, PNG, or GIF)')
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('Image size should be less than 5MB')
  }

  return errors
}