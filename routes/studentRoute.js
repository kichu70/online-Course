import express from "express"
import { check } from "express-validator";
import { addEnroll, addReview, allCourse, anyCourse, completedLecture, enrolledCourses, paidEnroll, singleCourse, singleLecture, trackProgress, viewLectuerVideos } from "../controllers/studentController.js";
import { authCheck } from "../middlewares/authCheck.js";


const router =express.Router();



router.get("/",allCourse)

router.get("/any-course",anyCourse)

router.use(authCheck);

router.get("/single-course",singleCourse)

router.post("/free-enroll",addEnroll)

router.post("/paid-enroll",paidEnroll)  

router.get("/enrolled-course",enrolledCourses)

router.get("/view-lecture",viewLectuerVideos)

router.post("/add-review",addReview)

router.get("/single-lecture",singleLecture)

router.post("/completed-lecture",completedLecture)

router.get("/track-progress", trackProgress);

export default router;