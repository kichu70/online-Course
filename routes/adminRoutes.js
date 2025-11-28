import express from "express"
import { authCheck } from "../middlewares/authCheck.js";
import { allCourse, allLectures, allUsers, deleteCourse, toggledeleteLecture, deleteUser, singelCourse, singleLecture, singleUser, toggleCourseStatus } from "../controllers/adminController.js";


const router =express.Router();

router.use(authCheck)

// ------admin function towards user-----------
router.get("/all-user",allUsers)
router.get("/single-user",singleUser)
router.put("/delete-reactive-user",deleteUser)


// -----------course----

// router.put("/approve-course",approveCourse)
// router.put("/rejecte-course",rejectCourse)

router.get("/all-course",allCourse)
router.get("/single-course",singelCourse)
router.put("/toggle-course-status",toggleCourseStatus)
router.put("/delete-reactive-course",deleteCourse)



// ----------------lectures--------------

router.get("/all-lecture",allLectures)
router.get("/single-lecture",singleLecture)
router.put("/delete-reactive-lecture",toggledeleteLecture)

export default router