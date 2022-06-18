const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Course = mongoose.model('Course', schema)

module.exports = Course
