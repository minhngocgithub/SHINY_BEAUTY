const cloudinary = require('../config/cloudinary');

const uploadImageCloudinary = async (file, folder = "avatars") => {
    try {
        const filePath = file.path || file; 
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto"
        });
        return {
            public_id: result.public_id,
            url: result.secure_url,
        }
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error)
        throw new Error("Failed to upload image")
    }
};

const deleteImageFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
};

module.exports = { 
    uploadImageCloudinary,
    deleteImageFromCloudinary 
};