const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Log', logSchema);
