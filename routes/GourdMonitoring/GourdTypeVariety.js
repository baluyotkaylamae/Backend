const express = require('express');
const Variety = require('../../models/GourdTypeVariety'); // Adjust the path as needed
const router = express.Router();

// Get all varieties
router.get('/', async (req, res) => {
    try {
        const varieties = await Variety.find().populate('gourdType', 'name description');
        res.status(200).json(varieties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a variety by ID
router.get('/:id', async (req, res) => {
    try {
        const variety = await Variety.findById(req.params.id).populate('gourdType', 'name description');
        if (!variety) {
            return res.status(404).json({ message: 'Variety not found' });
        }
        res.status(200).json(variety);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new variety
router.post('/', async (req, res) => {
    const variety = new Variety({
        name: req.body.name,
        gourdType: req.body.gourdType,
        description: req.body.description,
    });

    try {
        const newVariety = await variety.save();
        res.status(201).json(newVariety);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a variety by ID
router.put('/:id', async (req, res) => {
    try {
        const variety = await Variety.findById(req.params.id);
        if (!variety) {
            return res.status(404).json({ message: 'Variety not found' });
        }

        variety.name = req.body.name || variety.name;
        variety.gourdType = req.body.gourdType || variety.gourdType;
        variety.description = req.body.description || variety.description;

        const updatedVariety = await variety.save();
        res.status(200).json(updatedVariety);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a variety by ID
router.delete('/:id', async (req, res) => {
    try {
        const variety = await Variety.findById(req.params.id);
        if (!variety) {
            return res.status(404).json({ message: 'Variety not found' });
        }

        await Variety.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Variety deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
