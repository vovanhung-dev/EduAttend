const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');


router.delete('/deleteStudentFromExamList', examController.deleteStudentFromExamList);

// GET exam_list by exam_id
router.get('/exam_list/:id', examController.getExamListByExamId);

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

router.post('/addStudentToExamList', examController.addStudentToExamList);

router.post('/addStudentToExamList2', examController.addStudentToExamList2);

module.exports = router;
