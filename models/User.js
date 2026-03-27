const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    money: { type: Number, default: 500 },
    bank: { type: Number, default: 0 },
    diamonds: { type: Number, default: 0 },
    lastMine: { type: Date, default: 0 },
    lastDaily: { type: Date, default: 0 },
    pcLevel: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastMessage: { type: Number, default: 0 },
    lastWork: { type: Number, default: 0 } 
});

module.exports = mongoose.exports = mongoose.model('User', userSchema);