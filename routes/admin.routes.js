const router = require('express').Router();
const {dashboard, kelolaKelas, deleteCourse, login, addCourse, getAllCourse, addCategory, addMentor, getAllMentor, addChapter, addLesson, getAllChapter, updateCourse} = require('../controllers/admin.controllers');
const {image} = require('../libs/multer');
const {restrict} = require('../middlewares/auth.middlewares');

router.get('/dashboard', restrict, dashboard);
router.get('/kelolakelas', restrict, kelolaKelas);
router.delete('/course/:id', restrict, deleteCourse);
router.post('/login', login);
router.put('/course', restrict, updateCourse);
router.post('/category', image.single('image'),restrict, addCategory);
router.post('/mentor', restrict, addMentor);
router.get('/mentor', restrict, getAllMentor);
router.post('/course', restrict, addCourse);
router.get('/course', restrict, getAllCourse);
router.post('/chapter', restrict, addChapter);
router.get('/chapter', restrict, getAllChapter);
router.post('/lesson', restrict, addLesson);

module.exports = router;