const Gallery = require('../Models/gallery');
const cloudinary = require("../config/cloudinary");

// Get all gallery items
exports.getGalleryItems = async (req, res) => {
    try {
        const items = await Gallery.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name department');
        res.status(200).json({
            success: true,
            items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add item to gallery (Faculty only)
exports.addToGallery = async (req, res) => {
    try {
        const { title, category, description, uploadedBy, eventId } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!imageUrl) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }

        const newItem = new Gallery({
            title,
            category,
            description,
            imageUrl,
            uploadedBy,
            eventId: eventId || null
        });

        await newItem.save();

        res.status(201).json({
            success: true,
            message: "Added to gallery successfully",
            item: newItem
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete from gallery
exports.deleteFromGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Gallery.findById(id);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        // Delete from Cloudinary
        if (item.imageUrl) {
            const publicId = item.imageUrl.split("/").slice(-1)[0].split(".")[0];
            await cloudinary.uploader.destroy(`gallery/${publicId}`);
        }

        await Gallery.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Item removed from gallery"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
