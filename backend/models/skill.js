const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Skill = mongoose.model('Skill', schema)

module.exports = Skill
