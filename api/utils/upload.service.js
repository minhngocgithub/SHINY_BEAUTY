const cloudinary = require('../config/cloudinary');
const fs = require('fs')
const path = require('path')
const uploadImageCloudinary = async (file, folder = "avatars") => {
    let filePath = null;
    try {
        filePath = file.path || file; 
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: "auto"
        })
        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`✓ Deleted temporary file: ${path.basename(file.path)}`);
        }
        
        return {
            public_id: result.public_id,
            url: result.secure_url,
        }
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error)
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`✓ Cleaned up failed upload file: ${path.basename(filePath)}`)
            } catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError)
            }
        }
        
        throw new Error("Failed to upload image");
    }
};

const deleteImageFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
        return true
    } catch (error) {
        console.error('Error deleting image:', error)
        return false
    }
};

module.exports = { 
    uploadImageCloudinary,
    deleteImageFromCloudinary 
};