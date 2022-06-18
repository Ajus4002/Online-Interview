const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");
const mongoose = require("mongoose");
const Skill = require("../models/skill");
const JobApplication = require("../models/job-application");
const JobPost = require("../models/job-post");
const moment = require("moment");
const Joi = require('joi').extend(require('@joi/date'));

async function getAllJobs(req,res) {}

async function getMyJobs(req,res) {
    const data = await JobApplication.find()
        .where('user', req.userId)
        .sort({modifiedAt: 'desc'})
        .populate({
            path : 'job',
            populate : {
                path : 'skills'
            }
        })
        .populate({
            path : 'job',
            populate : {
                path : 'education'
            }
        })
        .populate('skills')
        .populate('experience.skills')
        .populate('education.course')
        .populate('interviewStats.assignedTo')
        .populate('interviewStats.interviewedBy')
        .exec()
    res.json(Response.success(data))
}

async function applyJob(req,res) {
    const jobId = req.params.id;

    const schema = Joi.object({
        name: Joi.string().required().trim(),
        email: Joi.string().required().email().lowercase(),
        mobile: Joi.string().required().trim(),
        skills: Joi.array().items(Joi.string()).required(),
        dateOfBirth: Joi.date().format('YYYY-MM-DD'),
        experience: Joi.array().items(Joi.object({
            from: Joi.date().required(),
            to: Joi.date(),
            jobTitle: Joi.string().required(),
            company: Joi.string().required(),
            skills: Joi.array().items(Joi.string()).min(1).required(),
        })).required(),
        education: Joi.array().items(Joi.object({
            from: Joi.date().required(),
            to: Joi.date(),
            course: Joi.string().required(),
            college: Joi.string().required(),
        })).required(),
        location: Joi.string().required(),
        address: Joi.string().required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);

    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(error.message))
    }

    value.skills = await Promise.all(value.skills.map(async v => {
        if (!mongoose.isValidObjectId(v)) {
            const found = await Skill.findOne({ name:  { $regex: v, $options: "i" } }).exec()
            if (found) {
                return found.id.toString()
            }

            const skill = new Skill({ name: v })
            await skill.save()
            return skill.id.toString()
        }

        return v;
    }))

    const job = await JobPost.findById(jobId).exec()
    if (!job.isOpen) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Job Posting has been closed'))
    }

    const found = await JobApplication.find({job: jobId, user: req.userId}).exec()
    if (found && found.length) {
        if (found.some(v => v.status === 'Pending' || v.status === 'Ongoing')) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Response.error('Already applied to this posting'))
        }
    }

    if (job.experience) {
        if (!job.skills.every(v => value.skills.includes(v.toString()))) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Response.error('Your application is ineligible. You does not have required skills.'))
        }

        const total_exp = value.experience.reduce((acc, v) => {
            const from = moment(v.from).startOf('month')
            const to = moment(v.to ?? undefined).endOf('month')

            return acc + to.diff(from, 'month', true)
        }, 0) / 12

        if (total_exp < job.experience) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Response.error('Your application is ineligible. You does not have required experience.'))
        }
    }

    if (!job.education.every(v => value.education.find(v2 => v2.course === v.toString()))) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Your application is ineligible. You does not have required education.'))
    }


    value.user = req.userId;
    value.job = jobId;
    value.status = 'Pending'

    try {
        const application = new JobApplication(value)
        await application.save()
    } catch (e) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error(e.message))
    }

    res.json(Response.success())
}

async function quickApplyJob(req, res) {
    const data = req.user

    if (
        !data.dateOfBirth ||
        !data.location ||
        !data.address ||
        !data.skills.length ||
        !data.experience.length ||
        !data.education.length
    ) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error("Profile incomplete. Quick apply option not available. You can apply manually or complete your profile."))
    }

    req.body = data

    return applyJob(req, res)
}

module.exports = {
    getAllJobs,
    getMyJobs,
    applyJob,
    quickApplyJob
}
