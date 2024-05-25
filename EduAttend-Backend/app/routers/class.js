const classController = require("../controllers/classController");
const router = require("express").Router();
const middleware = require('../utils/middleware');

router.post('/search', classController.getAllClasses); 
router.get('/:id', classController.getClassById); 
router.get("/searchByName", classController.searchClassByName); 
router.post('/', middleware.checkLogin, classController.createClass); 
router.put('/:id', middleware.checkLogin, classController.updateClass);
router.delete("/:id", middleware.checkLogin, classController.deleteClass);

module.exports = router;
