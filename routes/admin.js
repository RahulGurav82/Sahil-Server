const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Log = require('../models/Log');
const auth = require('../middleware/auth');

// Admin Model
const Admin = require('../models/Admin');

// Register Admin
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if admin already exists
        let admin = await Admin.findOne({ username });
        if (admin) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Create new admin
        admin = new Admin({
            username,
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);

        await admin.save();
        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create and return token
        const token = jwt.sign(
            { adminId: admin._id },
            'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all logs (protected route)
router.get('/logs', auth, async (req, res) => {
    try {
        const logs = await Log.find().sort({ loginTime: -1 }); // Sort by newest first
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching logs' });
    }
});

module.exports = router;
