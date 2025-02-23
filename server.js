const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const os = require('os');
const User = require('./models/User');
const Log = require('./models/Log');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://rahul:rahul@cluster0.l5ugu.mongodb.net/admin_dashboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Admin Routes
app.use('/api/admin', adminRoutes);

// User Routes
app.post('/api/user/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            email,
            username,
            password: hashedPassword
        });
        
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        // Create log entry
        const mumbaiAreas = [
            "Andheri", "Bandra", "Colaba", "Dadar", "Juhu", 
            "Powai", "Worli", "Malad", "Goregaon", "Borivali"
        ];
        
        const log = new Log({
            username: user.email,
            ipAddress: "192.168.1." + Math.floor(Math.random() * 255),
            location: "Mumbai, " + mumbaiAreas[Math.floor(Math.random() * mumbaiAreas.length)]
        });
        await log.save();

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Get Logs (For Admin)
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
