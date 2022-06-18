const mongoose = require('mongoose')
const {Schema} = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    skills: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
        required: false,
        default: []
    },
    experience: Number,
    education: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    level: { type: String, enum: ['Junior', 'Mid-Level', 'Senior', 'Intern'] },
    type: { type: String, enum: ['Full Time', 'Part Time'] },
    salary: {
        from: Number,
        to: Number
    },
    overview: {
        type: String
    },
    description: {
        type: String
    },
    isOpen: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const JobPost = mongoose.model('JobPost', schema)

module.exports = JobPost
