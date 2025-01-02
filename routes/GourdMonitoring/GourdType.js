const express = require('express');
const GourdType = require('../../models/GourdType'); // Adjust path as needed
const router = express.Router();

// Get all gourd types
router.get('/', async (req, res) => {
    try {
        const gourdTypes = await GourdType.find();
        res.status(200).json(gourdTypes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a gourd type by ID
router.get('/:id', async (req, res) => {
    try {
        const gourdType = await GourdType.findById(req.params.id);
        if (!gourdType) {
            return res.status(404).json({ message: 'Gourd type not found' });
        }
        res.status(200).json(gourdType);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new gourd type
router.post('/', async (req, res) => {
    const gourdType = new GourdType({
        name: req.body.name,
        description: req.body.description,
    });

    try {
        const newGourdType = await gourdType.save();
        res.status(201).json(newGourdType);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a gourd type by ID
router.put('/:id', async (req, res) => {
    try {
        const gourdType = await GourdType.findById(req.params.id);
        if (!gourdType) {
            return res.status(404).json({ message: 'Gourd type not found' });
        }

        gourdType.name = req.body.name || gourdType.name;
        gourdType.description = req.body.description || gourdType.description;

        const updatedGourdType = await gourdType.save();
        res.status(200).json(updatedGourdType);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a gourd type by ID
router.delete('/:id', async (req, res) => {
    try {
        const gourdType = await GourdType.findById(req.params.id);
        if (!gourdType) {
            return res.status(404).json({ message: 'Gourd type not found' });
        }

        await GourdType.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Gourd type deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
