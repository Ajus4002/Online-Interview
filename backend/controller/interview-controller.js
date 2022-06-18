const JobApplication = require("../models/job-application");
const {StatusCodes} = require("http-status-codes");
const {Response} = require("../helpers");
const moment = require("moment");
const WebSocketHandler = require("../websocket-handler");
const Joi = require('joi').extend(require('@joi/date'));

async function loadInterview(req, res) {
    const application = await JobApplication
        .findById(req.params.id)
        .populate('job')
        .populate('user')
        .populate('interviewStats.assignedTo')
        .exec()

    if (!application) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Application not found.'))
    }

    const interview = (application.interviewStats ?? []).find(v =>
        v.level === 'Online Interview'
        && !v.status
        && v.scheduledOn
        && moment(v.scheduledOn).startOf('date').diff(moment().startOf('date'), 'day') === 0
        && !v.attendedOn
    )

    if (!interview) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('No Interview Scheduled.'))
    }

    if (req.audience === 'admin') {
        interview.interviewedBy = req.userId
        await application.save()
    }

    res.json(Response.success({application, interview}))
}

async function addQuestion(req, res) {
    const schema = Joi.object({
        question: Joi.string().required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);
    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    const application = await JobApplication.findById(req.params.id).exec()
    if (!application) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Application Not found'))
    }

    const q = {
        question: value.question,
        answer: ''
    }

    if (!application.questions) {
        application.questions = []
    }

    application.questions.push(q)
    await application.save()

    const q1 = application.questions[application.questions.length - 1]

    WebSocketHandler.sendMsg(application.user.toString(), {
        from: req.userId,
        to: application.user,
        subject: 'question',
        question: q1
    })

    res.json(Response.success(q1))
}

async function addAnswer(req, res) {
    const schema = Joi.object({
        answer: Joi.string().required(),
    }).options({stripUnknown:true})

    const { value, error } = schema.validate(req.body);
    if (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Invalid Request ' + error.message))
    }

    const application = await JobApplication.findById(req.params.id).exec()
    if (!application) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Application Not found'))
    }

    const question = (application.questions ?? []).find(v => v._id.toString() === req.params.qid)
    if (!question) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Question Not found'))
    }

    question.answer = value.answer
    await application.save()

    const interview = (application.interviewStats ?? []).find(v => v.level === 'Online Interview')

    WebSocketHandler.sendMsg(interview.interviewedBy.toString(), {
        from: req.userId,
        to: interview.interviewedBy,
        subject: 'question-answer',
        question: question
    })

    res.json(Response.success(question))
}

async function finishInterview(req, res) {
    const application = await JobApplication.findById(req.params.id).exec()
    if (!application) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(Response.error('Application Not found'))
    }

    const interview = (application.interviewStats ?? []).find(v => v.level === 'Online Interview')
    interview.attendedOn = Date.now()
    interview.interviewedBy = req.userId

    await application.save()

    res.json(Response.success())
}


module.exports = {
    loadInterview,
    addQuestion,
    addAnswer,
    finishInterview
}
