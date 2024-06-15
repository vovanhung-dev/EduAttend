const classController = require("../controllers/classController");
const router = require("express").Router();
const middleware = require('../utils/middleware');


// Thêm các endpoint cho lịch thi
router.put('/updateExamSchedule/:id', middleware.checkLogin, classController.updateExamSchedule);
router.post('/createExamSchedule', middleware.checkLogin, classController.createExamSchedule);
router.get('/getAllExamSchedules', classController.getAllExamSchedules);
router.get('/getExamScheduleById/:id', classController.getExamScheduleById);
router.delete('/deleteExamSchedule/:id', middleware.checkLogin, classController.deleteExamSchedule);


router.get('/students/:id', classController.getStudentsByClassId);
router.post('/addUser', middleware.checkLogin, classController.addUserToClass);
router.get("/searchByName", classController.searchClassByName); 
router.post('/search', classController.getAllClasses); 
router.get('/:id', classController.getClassById); 
router.post('/', middleware.checkLogin, classController.createClass); 
router.put('/:id', middleware.checkLogin, classController.updateClass);
router.delete("/:id", middleware.checkLogin, classController.deleteClass);
router.post('/removeUser', middleware.checkLogin, classController.removeUserFromClass);

module.exports = router;
