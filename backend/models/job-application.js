const mongoose = require('mongoose')
const {Schema} = require("mongoose")

const interviewStatsSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: [
            'Shortlisting',
            'Skill Test',
            'Online Interview',
            'Group Discussion',
            'Final Interview'
        ]
    },
    scheduledOn: { type: Date, default: null },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    attendedOn: { type: Date, default: null },
    interviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    score: { type: Number, default: null },
    status: { type: String, enum: ['Pass', 'Fail', ''], default: null},
    remarks: { type: String, default: null }
})

const questionSchema = new mongoose.Schema({
    question: String,
    answer: String
})

const schema = new mongoose.Schema({
    job: {
        type: Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        maxlength: 10
    },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    dateOfBirth: {
        type: Date,
        trim: true,
    },
    experience: [
        new Schema({
            from: {
                type: Date,
                required: true
            },
            to: Date,
            jobTitle: {
                type: String,
                required: true
            },
            skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
            company: {
                type: String,
                required: true
            }
        })
    ],
    education: [
        new Schema({
            from: {
                type: String,
                required: true
            },
            to: Date,
            course: { type: Schema.Types.ObjectId, ref: 'Course' },
            college: {
                type: String,
                required: true
            }
        })
    ],
    location: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    status: { type: String, enum: ['Pending', 'Ongoing', 'Rejected', 'Selected', 'Closed'] },
    interviewStats: [interviewStatsSchema],
    verifications: [
        { name: String, isVerified: Boolean }
    ],
    questions: [
        questionSchema
    ]
}, { timestamps: true })

const JobApplication = mongoose.model('JobApplication', schema)

module.exports = JobApplication
