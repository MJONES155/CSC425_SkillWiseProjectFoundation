// TODO: Implement submission routes
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');

// TODO: Add POST / route for submitting work
router.post('/', auth, submissionController.submitWork);

// TODO: Add GET /:id route for getting submission
router.get('/:id', auth, submissionController.getSubmission);

// TODO: Add GET /user/:userId route for user submissions
router.get('/user/:userId', auth, submissionController.getUserSubmissions);

// TODO: Add PUT /:id route for updating submission
router.put('/:id', auth, submissionController.updateSubmission);

module.exports = router;
