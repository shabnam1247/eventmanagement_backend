const express = require('express');
const router = express.Router();
const galleryController = require('../Controllers/galleryController');
const upload = require("../middleware/upload");

// Public routes
router.get('/', galleryController.getGalleryItems);

// Faculty routes (protected ideally, but following existing pattern)
router.post('/add', upload.single('image'), galleryController.addToGallery);
router.delete('/:id', galleryController.deleteFromGallery);

module.exports = router;
