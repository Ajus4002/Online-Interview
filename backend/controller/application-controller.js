const JobApplication = require("../models/job-application");
const {Response} = require("../helpers");
const {StatusCodes} = require("http-status-codes");
const Joi = require('joi').extend(require('@joi/date'));

async function getApplications(req, res) {
    const data = await JobApplication.find()
        .sort({createdAt: 'desc'})
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

async function getApplication(req, res) {
    const data = await JobApplication.findById(req.params.id)
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

async function changeStatus(req, res) {
    const schema = Joi.object({
        status: Joi.string().valid('Pending', 'Ongoing', 'Rejected', 'Selected', 'Closed').required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);
    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    const data = await JobApplication.findById(req.params.id);
    data.status = value.status;
    await data.save()
    return res.json(Response.success())
}

async function changeInterview(req, res) {
    const level = req.body.level
    const data = await JobApplication.findById(req.params.id);

    let found = null
    let foundIndex = data.interviewStats?.findIndex(v => v.level === level)
    if (foundIndex === -1) {
        if (!data.interviewStats) {
            data.interviewStats = []
        }

        found = {
            level,
            scheduledOn: null,
            assignedTo: null,
            attendedOn: null,
            interviewedBy: null,
            score: null,
            status: '',
        }
        data.interviewStats.push(found)
        foundIndex = data.interviewStats.length - 1
    } else {
        found = data.interviewStats[foundIndex]
    }

    Object.keys(req.body).forEach(v => {
        found[v] = req.body[v]
    })

    data.interviewStats.splice(foundIndex,1, found);

    await data.save()
    return res.json(Response.success())
}

async function changeVerification(req, res) {
    const name = req.body.name
    const data = await JobApplication.findById(req.params.id);

    let found = null
    let foundIndex = data.verifications?.findIndex(v => v.name === name)
    if (foundIndex === -1) {
        if (!data.verifications) {
            data.verifications = []
        }

        found = { name, isVerified: false }
        data.verifications.push(found)
        foundIndex = data.verifications.length - 1
    } else {
        found = data.verifications[foundIndex]
    }

    Object.keys(req.body).forEach(v => {
        found[v] = req.body[v]
    })

    data.verifications.splice(foundIndex,1, found);

    await data.save()
    return res.json(Response.success())
}

module.exports = {
    getApplications,
    getApplication,
    changeStatus,
    changeInterview,
    changeVerification
}
