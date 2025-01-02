const express = require('express');
const Monitoring = require('../../models/Monitoring'); // Adjust the path as needed
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
router.post('/', async (req, res) => {
    const monitoring = new Monitoring({
        userID: req.auth.userId,
        gourdType: req.body.gourdType,
        variety: req.body.variety,
        dateOfPollination: req.body.dateOfPollination,
        pollinatedFlowers: req.body.pollinatedFlowers,
        fruitsHarvested: req.body.fruitsHarvested || 0,
        dateOfFinalization: req.body.dateOfFinalization || null,
        status: req.body.status || 'In Progress',
    });

    try {
        const newMonitoring = await monitoring.save();
        res.status(201).json(newMonitoring);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a monitoring record by ID
router.put('/:id', async (req, res) => {
    try {
        const monitoring = await Monitoring.findById(req.params.id);
        if (!monitoring) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }

        monitoring.userID = req.auth.userId || monitoring.userID;
        monitoring.gourdType = req.body.gourdType || monitoring.gourdType;
        monitoring.variety = req.body.variety || monitoring.variety;
        monitoring.dateOfPollination = req.body.dateOfPollination || monitoring.dateOfPollination;
        monitoring.pollinatedFlowers = req.body.pollinatedFlowers ?? monitoring.pollinatedFlowers;
        monitoring.fruitsHarvested = req.body.fruitsHarvested ?? monitoring.fruitsHarvested;
        monitoring.dateOfFinalization = req.body.dateOfFinalization || monitoring.dateOfFinalization;
        monitoring.status = req.body.status || monitoring.status;

        const updatedMonitoring = await monitoring.save();
        res.status(200).json(updatedMonitoring);
    } catch (err) {
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
