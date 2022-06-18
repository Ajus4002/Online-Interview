const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");
const JobPost = require("../models/job-post");
const mongoose = require("mongoose");
const Skill = require("../models/skill");
const Course = require("../models/course");
const Joi = require('joi').extend(require('@joi/date'));

async function add(req, res) {
    const schema = Joi.object({
        title: Joi.string().required(),
        skills: Joi.array().items(Joi.string()),
        experience: Joi.number(),
        education: Joi.array().items(Joi.string()),
        level: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Intern').required(),
        type: Joi.string().valid('Full Time', 'Part Time').required(),
        salary: {
            from: Joi.number().required(),
            to: Joi.number(),
        },
        overview: Joi.string(),
        description: Joi.string()
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);
    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    value.skills = await Promise.all(value.skills.map(async v => {
        if (!mongoose.isValidObjectId(v)) {
            const found = await Skill.findOne({ name:  { $regex: v, $options: "i" } }).exec()
            if (found) {
                return found.id.toString()
            } else {
                const skill = new Skill({ name: v })
                await skill.save()
                return skill.id.toString()
            }
        }

        return v;
    }))

    value.education = await Promise.all(value.education.map(async v => {
        if (!mongoose.isValidObjectId(v)) {
            const found = await Course.findOne({ name:  { $regex: v, $options: "i" } }).exec()
            if (found) {
                return found.id.toString()
            } else {
                const course = new Course({ name: v })
                await course.save()
                return course.id.toString()
            }
        }

        return v;
    }))

    const job = new JobPost(value)
    await job.save()

    return res.json(Response.success())
}

async function closeJob(req, res) {
    const jobId = req.params.id

    const job = await JobPost.findById(jobId).exec()
    job.isOpen = false
    await job.save()

    return res.json(Response.success())
}

async function list(req, res) {
    const jobs = await JobPost.find().populate('skills').populate('education').exec()
    return res.json(Response.success(jobs))
}

async function get(req, res) {
    const jobId = req.params.id
    const job = await JobPost.findById(jobId).populate('skills').populate('education').exec()
    return res.json(Response.success(job))
}

module.exports = {
    add,
    closeJob,
    list,
    get
}
