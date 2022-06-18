const router = require('express').Router();
const AdminController = require("../controller/admin-controller");
const JobController = require("../controller/job-controller");
const ApplicationController = require("../controller/application-controller");
const AccountController = require("../controller/account-controller");
const InterviewController = require("../controller/interview-controller");
const {requiresAuth} = require("../controller/auth-middleware");

router.get('/skills', AdminController.getSkills);
router.get('/courses', AdminController.getCourses);
router.post('/login', AdminController.login);

router.put('/account/me/basic', requiresAuth, AdminController.updateAccountBasic)
router.patch('/account/me/password', requiresAuth, AdminController.updatePassword)
router.patch('/account/me/email', requiresAuth, AdminController.updateEmail)
router.get('/account/me', requiresAuth, AdminController.getMe)

router.get('/job', requiresAuth, JobController.list);
router.post('/job', requiresAuth, JobController.add);
router.get('/job/:id', requiresAuth, JobController.get);
router.patch('/job/:id/close', requiresAuth, JobController.closeJob);

router.get('/applications', requiresAuth, ApplicationController.getApplications);
router.get('/application/:id', requiresAuth, ApplicationController.getApplication);
router.patch('/application/:id/status', requiresAuth, ApplicationController.changeStatus);
router.patch('/application/:id/interview', requiresAuth, ApplicationController.changeInterview);
router.patch('/application/:id/verification', requiresAuth, ApplicationController.changeVerification);

router.get('/application/:id/interview/check', requiresAuth, InterviewController.loadInterview);
router.post('/application/:id/interview/finish', requiresAuth, InterviewController.finishInterview);
router.post('/application/:id/interview/question', requiresAuth, InterviewController.addQuestion);

router.get('/accounts', requiresAuth, AccountController.getAccounts);
router.get('/accounts/:id', requiresAuth, AccountController.getAccount);
router.put('/accounts/:id', requiresAuth, AccountController.updateAccount);
router.delete('/accounts/:id', requiresAuth, AccountController.deleteAccount);
router.post('/accounts', requiresAuth, AccountController.addAccounts);


router.get('/add/admin', AdminController.addAdmin);

module.exports = router;
