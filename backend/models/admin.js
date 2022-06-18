const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

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
    type: {
        type: String,
        required: true,
        trim: true,
        enum: ['Admin', 'Staff'],
    },
    isDeleted: {
        type: Boolean,
        default: false
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

const Admin = mongoose.model('Admin', schema)

module.exports = Admin
