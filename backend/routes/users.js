const express = require('express');
const router = express.Router();
const UserController = require('../controller/user-controller')
const UserJobController = require('../controller/user-job-controller')
const {requiresAuth} = require("../controller/auth-middleware");
const JobController = require("../controller/job-controller");
const InterviewController = require("../controller/interview-controller");

router.post('/register', UserController.register)
router.post('/login', UserController.login)

router.get('/account', requiresAuth, UserController.getAccount)
router.put('/account/basic', requiresAuth, UserController.updateAccountBasic)

router.patch('/password', requiresAuth, UserController.updatePassword)
router.patch('/email', requiresAuth, UserController.updateEmail)

router.post('/skills', requiresAuth, UserController.addSkill)
router.delete('/skills/:id', requiresAuth, UserController.removeSkill)

router.post('/education', requiresAuth, UserController.addEducation)
router.put('/education/:id', requiresAuth, UserController.updateEducation)
router.delete('/education/:id', requiresAuth, UserController.removeEducation)

router.post('/experience', requiresAuth, UserController.addExperience)
router.put('/experience/:id', requiresAuth, UserController.updateExperience)
router.delete('/experience/:id', requiresAuth, UserController.removeExperience)

router.get('/jobs', JobController.list);
router.get('/job/:id', JobController.get);
router.get('/jobs/my', requiresAuth, UserJobController.getMyJobs)
router.post('/jobs/:id/apply', requiresAuth, UserJobController.applyJob)
router.post('/jobs/:id/apply/quick', requiresAuth, UserJobController.quickApplyJob)

router.get('/application/:id/interview/online', requiresAuth, InterviewController.loadInterview)
router.post('/application/:id/interview/question/:qid/answer', requiresAuth, InterviewController.addAnswer)

module.exports = router;
