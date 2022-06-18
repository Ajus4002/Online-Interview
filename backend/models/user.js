const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const {Schema} = require("mongoose");

const schema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true,
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
    }
}, { timestamps: true })

schema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

schema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', schema)

module.exports = User
