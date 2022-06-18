const Joi=require('joi');
const{StatusCodes}=require('http-status-codes');
const { Response } = require('../helpers');
const Admin = require('../models/admin');
const jwt=require('jsonwebtoken')
const Skill = require("../models/skill");
const Course = require("../models/course");
const User = require("../models/user");

async function login(req,res){
    const email = req.body['email']
    const password = req.body['password']

    if (!email || !password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email and password is required"))
    }

    const admin = await Admin.findOne({ email }).exec()
    if (!admin) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email or password invalid"))
    }

    let isCorrect = await admin.comparePassword(password)
    if (!isCorrect) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Email or password invalid"))
    }

    const expiresIn = process.env.JWT_EXPIRY;
    const token = jwt.sign({
        admin: admin
    }, process.env.JWT_SECRET, { expiresIn, subject: admin.id, audience: 'admin'});

    return res.json(Response.success({ token, expiresIn, admin }))
}

function addAdmin(req, res) {
    const admin = new Admin()
    admin.name = 'Admin'
    admin.mobile = '1234567890'
    admin.type = 'Admin'
    admin.email = 'admin1@admin.com'
    admin.password = '123456'
    admin.save()

    res.send()
}

async function getSkills(req, res) {
    const skills = await Skill.find().exec()
    return res.json(Response.success(skills))
}

async function getCourses(req, res) {
    const skills = await Course.find().exec()
    return res.json(Response.success(skills))
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

    const isFound = await Admin.findOne({})
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

async function getMe(req, res) {
    const user = await Admin.findById(req.userId)
        .exec()
    return res.json(Response.success(user))
}


module.exports= {
    login,
    addAdmin,
    getSkills,
    getCourses,
    updatePassword,
    updateEmail,
    updateAccountBasic,
    getMe
}
