const Joi = require('joi').extend(require('@joi/date'));
const { StatusCodes } = require('http-status-codes');
const { Response } = require('../helpers');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const mongoose = require("mongoose");
const Skill = require("../models/skill");

async function register(req,res) {

    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        mobile: Joi.string().required(),
        password: Joi.string().min(6).required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('invalid request'))
    }

    if (await User.findOne({ email: value.email })) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('user already exists'))
    }

    const user = new User(value)
    await user.save()

    return res
        .status(StatusCodes.OK)
        .json(Response.success(user))
}

async function login(req, res) {

    const email = req.body['email']
    const password = req.body['password']

    if (!email || !password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email and password is required"))
    }

    const user = await User.findOne({ email }).exec()
    if (!user) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email or password invalid"))
    }

    let isCorrect = await user.comparePassword(password)
    if (!isCorrect) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email or password invalid"))
    }

    const expiresIn = process.env.JWT_EXPIRY;
    const token = jwt.sign({
        user: user
    }, process.env.JWT_SECRET, { expiresIn, subject: user.id, audience: 'user'});

    return res.json(Response.success({ token, expiresIn, user }))
}

async function getAccount(req, res) {
    const user = await User.findById(req.userId)
        .populate('skills')
        .populate('experience.skills')
        .populate('education.course')
        .exec()
    return res.json(Response.success(user))
}

async function updatePassword(req ,res) {
    const user = req.user

    const schema = Joi.object({
        oldPassword: Joi.string().min(6).required(),
        newPassword: Joi.string().min(6).required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('invalid request'))
    }

    let isCorrect = await user.comparePassword(value.oldPassword)
    if (!isCorrect) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Incorrect password"))
    }

    return res.json(Response.success())
}

async function updateEmail(req, res) {
    const user = req.user
    const id = req.userId;

    const schema = Joi.object({
        email: Joi.string().email().required()
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    const isFound = await User.findOne({})
        .where('email').equals(value.email)
        .where('id').ne(id)
        .exec()

    if (isFound) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email already exists"))
    }

    user.email = value.email
    await user.save()

    return res.json(Response.success())
}

async function updateAccountBasic(req, res) {
    const user = req.user

    const schema = Joi.object({
        name: Joi.string(),
        mobile: Joi.string(),
        dateOfBirth: Joi.date().format('YYYY-MM-DD'),
        location: Joi.string(),
        address: Joi.string(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    user.set(value)
    await user.save()

    return res.json(Response.success())
}

async function addSkill(req, res) {
    const user = req.user

    const schema = Joi.object({
        skill: Joi.string().required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    let skillId = null
    if (!mongoose.isValidObjectId(value.skill)) {
        const found = await Skill.findOne({ name:  { $regex: value.skill, $options: "i" } })
        if (found) {
            skillId = found.id.toString()
        } else {
            const skill = new Skill({ name: value.skill })
            await skill.save()
            skillId = skill.id.toString()
        }
    } else {
        skillId = value.skill
    }

    if (!user.skills.find( v => v.toString() === skillId)) {
        user.skills.push(skillId)
    }

    await user.save()

    return res.json(Response.success())
}

async function removeSkill(req, res) {
    const user = req.user
    const skillId = req.params.id

    user.skills = user.skills.filter(v => v.toString() !== skillId)
    await user.save()

    return res.json(Response.success())
}

async function addEducation(req, res) {
    const user = req.user

    const schema = Joi.object({
        from: Joi.date().required(),
        to: Joi.date(),
        course: Joi.string().required(),
        college: Joi.string().required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    user.education.push(value)
    await user.save()

    return res.json(Response.success())
}

async function updateEducation(req, res) {
    const user = req.user
    const eduId = req.params.id

    const schema = Joi.object({
        from: Joi.date().format('MMM-YYYY').required(),
        to: Joi.date().format('MMM-YYYY'),
        course: Joi.string().required(),
        college: Joi.string().required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    const edu = user.education.find(v => v._id.toString() === eduId)
    edu.set(value)
    await user.save()

    return res.json(Response.success())
}

async function removeEducation(req, res) {
    const user = req.user
    const eduId = req.params.id

    user.education = user.education.filter(v => v._id.toString() !== eduId)
    await user.save()

    return res.json(Response.success())
}

async function addExperience(req, res) {
    const user = req.user

    const schema = Joi.object({
        from: Joi.date().required(),
        to: Joi.date(),
        jobTitle: Joi.string().required(),
        company: Joi.string().required(),
        skills: Joi.array().items(Joi.string()).min(1).required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    user.experience.push(value)
    await user.save()

    return res.json(Response.success())
}

async function updateExperience(req, res) {
    const user = req.user
    const expId = req.params.id

    const schema = Joi.object({
        from: Joi.date().format('MMM-YYYY').required(),
        to: Joi.date().format('MMM-YYYY'),
        jobTitle: Joi.string().required(),
        company: Joi.string().required(),
        skills: Joi.array().items(Joi.string()).min(1).required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    const edu = user.experience.find(v => v._id.toString() === expId)
    edu.set(value)
    await user.save()

    return res.json(Response.success())
}

async function removeExperience(req, res) {
    const user = req.user
    const expId = req.params.id

    user.experience = user.experience.filter(v => v._id.toString() !== expId)
    await user.save()

    return res.json(Response.success())
}

module.exports = {
    register,
    login,
    getAccount,
    updatePassword,
    updateEmail,
    updateAccountBasic,
    addSkill,
    removeSkill,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience
}
