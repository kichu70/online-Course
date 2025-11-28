import express from "express";
import { check } from "express-validator";
import { login, register, updateUser, viewProfile } from "../controllers/authController.js";
import { authCheck } from "../middlewares/authCheck.js";
import { upload } from "../utils/multerFileUploads.js";

const router = express.Router();

router.post(
  "/add-user",upload.single("profile"),
  [
    check("name")
      .notEmpty()
      .withMessage("username must Required")
      .isLength({ min: 3 })
      .withMessage("name must contain at least 3 charecters"),
    check("password")
      .notEmpty()
      .withMessage("Password is Reqierd")
      .isLength({ min: 8 })
      .withMessage("must contain atleast 8 charecter"),
    check("email")
      .isEmail()
      .withMessage("Invalid email format")
      .notEmpty()
      .withMessage("Email required"),
    check("bio").optional(),
    check("role")
      .notEmpty()
      .withMessage("Role must needed")
      .isIn(["student", "instructor"])
      .withMessage("Role must be student or instructor"),
  ],
  register
);

router.post(
  "/login",
  [
    check("email")
      .notEmpty()
      .withMessage("Email requiered")
      .isEmail()
      .withMessage("Invalid email format"),
    check("password")
      .notEmpty()
      .withMessage("Password is Reqierd")
      .isLength({ min: 8 })
      .withMessage("must contain atleast 8 charecter"),
  ],
  login
);

router.use(authCheck);

router.put(
  "/update-user",upload.single("profile"),
  [
    check("name")
      .optional()
      .isLength({ min: 3 })
      .withMessage("name must contain at least 3 charecters"),
    check("password")
      .optional()
      .isLength({ min: 8 })
      .withMessage("must contain atleast 8 charecter"),
    check("bio").optional(),
  ],
  updateUser
);

router.get("/profile",viewProfile)

export default router;
