const express = require('express');
const Monitoring = require('../../models/Monitoring'); // Adjust the path as needed
const cloudinary = require("cloudinary").v2;
const upload = require('../../config/multer');
const router = express.Router();

// Get all monitoring records
router.get('/', async (req, res) => {
    try {
        const monitorings = await Monitoring.find()
            .populate('userID', 'name email')
            .populate('gourdType', 'name description')
            .populate('variety', 'name description');
        res.status(200).json(monitorings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a monitoring record by ID
router.get('/:userId', async (req, res) => {
    try {
        const monitorings = await Monitoring.find({ userID: req.params.userId })
            .populate('userID', 'name email')
            .populate('gourdType', 'name description')
            .populate('variety', 'name description');
        if (!monitorings) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }
        res.status(200).json(monitorings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new monitoring record
router.post('/', upload.array("pollinatedFlowerImages"), async (req, res) => {
    try {
        const {
            gourdType,
            variety,
            dateOfPollination,
            pollinatedFlowers,
            fruitsHarvested,
            dateOfFinalization,
            status,
        } = req.body;

        // Ensure dateOfPollination is present
        if (!dateOfPollination) {
            return res.status(400).json({ message: 'dateOfPollination is required' });
        }

        // Parse dateOfPollination to ensure it's a valid Date
        const parsedDateOfPollination = new Date(dateOfPollination);
        if (isNaN(parsedDateOfPollination)) {
            return res.status(400).json({ message: 'Invalid dateOfPollination' });
        }

        // Handle file uploads for pollinatedFlowerImages
        let pollinatedFlowerImages = [];
        if (req.files && req.files.length > 0) {
            const flowerFiles = req.files.filter(file => file.fieldname === 'pollinatedFlowerImages');
            for (const file of flowerFiles) {
                const result = await cloudinary.uploader.upload(file.path);
                pollinatedFlowerImages.push(result.secure_url);
            }
        }

        // Handle file uploads for fruitHarvestedImages
        let fruitHarvestedImages = [];
        if (req.files && req.files.length > 0) {
            const fruitFiles = req.files.filter(file => file.fieldname === 'fruitHarvestedImages');
            for (const file of fruitFiles) {
                const result = await cloudinary.uploader.upload(file.path);
                fruitHarvestedImages.push(result.secure_url);
            }
        }

        // Validate and handle fruitsHarvested
        const validatedFruitsHarvested = isNaN(fruitsHarvested) || fruitsHarvested === 'null' ? 0 : fruitsHarvested;

        // Validate and handle dateOfFinalization
        const validatedDateOfFinalization = dateOfFinalization === 'null' ? null : dateOfFinalization;

        const newMonitoring = new Monitoring({
            userID: req.auth.userId,
            gourdType,
            variety,
            dateOfPollination: parsedDateOfPollination,  // Use parsed date here
            pollinatedFlowers,
            pollinatedFlowerImages,
            fruitsHarvested: validatedFruitsHarvested,
            fruitHarvestedImages,
            dateOfFinalization: validatedDateOfFinalization,
            status: status || 'In Progress',
        });

        await newMonitoring.save();
        res.status(201).json({
            message: 'Monitoring record created successfully',
            monitoring: newMonitoring,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Monitoring validation failed', errors: err.errors });
    }
});


// Update a monitoring record by ID
router.put('/:id', upload.array('fruitHarvestedImages'), async (req, res) => {
    console.log("Request body:", req.body); // Debugging line
    try {
        const monitoring = await Monitoring.findById(req.params.id);
        if (!monitoring) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }

        console.log("Updating monitoring:", req.body);  // Debugging line

        // Update fields with request body or use current values if not provided
        monitoring.userID = req.auth.userId || monitoring.userID;
        monitoring.gourdType = req.body.gourdType || monitoring.gourdType;
        monitoring.variety = req.body.variety || monitoring.variety;
        monitoring.dateOfPollination = req.body.dateOfPollination || monitoring.dateOfPollination;
        monitoring.pollinatedFlowers = req.body.pollinatedFlowers ?? monitoring.pollinatedFlowers;
        monitoring.pollinatedFlowerImages = req.body.pollinatedFlowerImages || monitoring.pollinatedFlowerImages;
        monitoring.fruitsHarvested = req.body.fruitsHarvested ?? monitoring.fruitsHarvested;
        monitoring.fruitHarvestedImages = req.body.fruitHarvestedImages || monitoring.fruitHarvestedImages;
        monitoring.dateOfFinalization = req.body.dateOfFinalization || monitoring.dateOfFinalization;
        monitoring.status = req.body.status || monitoring.status;

        // Handle file uploads if any
        let fruitHarvestedImages = monitoring.fruitHarvestedImages || [];  // Initialize with existing images if any
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                fruitHarvestedImages.push(result.secure_url);  // Add the URL of the uploaded image
            }
        }

        // Ensure the final value for fruitHarvestedImages is saved correctly
        monitoring.fruitHarvestedImages = fruitHarvestedImages;

        console.log("Updated monitoring:", monitoring);  // Debugging line

        const updatedMonitoring = await monitoring.save();
        res.status(200).json(updatedMonitoring);
    } catch (err) {
        console.error(err);  // Log error
        res.status(400).json({ message: err.message });
    }
});

// Delete a monitoring record by ID
router.delete('/:id', async (req, res) => {
    try {
        const monitoring = await Monitoring.findById(req.params.id);
        if (!monitoring) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }

        await Monitoring.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Monitoring record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
