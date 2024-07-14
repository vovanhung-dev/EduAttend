const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');


// SEARCH exams
router.get('/search', examController.searchExams);

// GET all exams
router.get('/', examController.getAllExams);

// GET exam by ID
router.get('/:id', examController.getExamById);

// CREATE new exam
router.post('/', examController.createExam);

// UPDATE exam by ID
router.put('/:id', examController.updateExam);

// DELETE exam by ID
router.delete('/:id', examController.deleteExam);


module.exports = router;
