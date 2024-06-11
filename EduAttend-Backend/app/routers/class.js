const classController = require("../controllers/classController");
const router = require("express").Router();
const middleware = require('../utils/middleware');

router.get('/students/:id', classController.getStudentsByClassId);
router.post('/addUser', middleware.checkLogin, classController.addUserToClass);
router.get("/searchByName", classController.searchClassByName); 
router.post('/search', classController.getAllClasses); 
router.get('/:id', classController.getClassById); 
router.post('/', middleware.checkLogin, classController.createClass); 
router.put('/:id', middleware.checkLogin, classController.updateClass);
router.delete("/:id", middleware.checkLogin, classController.deleteClass);

module.exports = router;
