import express from "express";
import {
  addLecture,
  allLecture,
  avgRating,
  createCoures,
  deleteCourse,
  deleteLecture,
  enrolledDetails,
  instructorCourse,
  instructorEarnings,
  mostRatedCourse,
  singleCourse,
  singleLecture,
  updateCourse,
  updateLecture,
} from "../controllers/instructorController.js";
import { upload } from "../utils/multerFileUploads.js";
import { authCheck } from "../middlewares/authCheck.js";
import { check } from "express-validator";

const router = express.Router();

router.use(authCheck);

router.get("/all-course", instructorCourse);

router.get("/top-rated-course", mostRatedCourse);

router.get('/enrolled-students',enrolledDetails)

router.get("/single-course",singleCourse)

router.post(
  "/add-course",
  upload.single("thumbnail"),
  [
    check("title")
      .notEmpty()
      .withMessage("Name Requierd")
      .isLength({ min: 3 })
      .withMessage("length need more than 3 "),
    check("description")
      .notEmpty()
      .withMessage("must need a description")
      .isLength({ min: 3 })
      .withMessage("length need morethan 3 character"),
    check("category")
      .notEmpty().withMessage("Category is required")
      .isIn(['BCA','B-come','BA','BBA']).withMessage("Category must be either 'BCA','B-come','BA','BBA'"),
    check("price")
      .optional()
      .custom((value) => {
    if (value === "" || value === null || value === undefined) return true;

    const num = Number(value);
    if (isNaN(num)) throw new Error("Price must be a number");

    if (num === 0) return true;  
    if (num >= 50) return true;

    throw new Error("Price must be 0 (free) or at least ₹50");
  })
  ],
  createCoures  
);

router.put(
  "/update-course",
  [
    check("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("length need more than 3 "),
    check("description")
      .optional()
      .isLength({ min: 3 })
      .withMessage("length need morethan 3 character"),
    check("category").optional(),
    check("price")
      .optional()
       .custom((value) => {
    const num = parseFloat(value);

    if (num === 0) return true;  
    if (num === null) return true;  
    if (num >= 50) return true;

    throw new Error("Price must be 0 (free) or at least ₹50");
  })
    ,
  ],
  updateCourse
);

router.put("/delete-course", deleteCourse);


// -------------------lecture routes--------
router.get("/all-lecture",allLecture)
router.get("/single-lecture",singleLecture)

router.post(
  "/add-lecture",
  upload.single("video"),
  [
    check("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("length need more than 3 "),
  ],
  addLecture
);

router.put(
  "/update-lecture",
  [
    check("title")
      .optional()
      .isLength({ min: 3 })
      .withMessage("length need more than 3 "),
  ],
  updateLecture
);

router.put("/delete-lecture", deleteLecture);



router.get("/avarge-rating",avgRating)

// --------------total earnings------------------

router.get("/total-earning",instructorEarnings)


export default router;
