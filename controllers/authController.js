import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendOtpMail } from "../utils/email.js";

//  -----------"User Register"-------------------------------------------------------------

export const register = async (req, res) => {
  try {
    const { name, password, email, role, bio } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const FieldErrors = {};
      errors.array().forEach((err) => {
        const key = err.path;
        FieldErrors[key] = err.msg;
      });
      return res.status(400).json({
        message: "field missing",
        msg: FieldErrors,
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const UserExist = await User.findOne({ name });
      if (UserExist) {
        return res.status(401).json({ message: "username already exist" });
      } else {
        const EmailExist = await User.findOne({ email });
        if (EmailExist) {
          return res.status(401).json({ message: "email already exist" });
        } else {
          const profilePic = req.file
            ? `/uploads/${req.file.filename}`
            : "/uploads/profile.jpg";

          const newUser = await User.create({
            name,
            password: hashedPassword,
            email,
            bio,
            role,
            profile_pic: profilePic,
          });
          const token = jwt.sign(
            {
              id: newUser._id,
              role: newUser.role,
              name: newUser.name,
              profile_pic:profilePic,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );
          const userData = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          };
          res.json({
            message: "user created",
            AccessToken: token,
            userData: userData,
          });
        }
      }
    }
  } catch (err) {
    console.log(err, "error is in the addind user in backend");
    res.status(500).json({ message: "server is error to do add user backend" });
  }
};

//--------------login user --------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const FieldErrors = {};
      errors.array().forEach((err) => {
        const key = err.path;
        FieldErrors[key] = err.msg;
      });

      return res.status(400).json({
        message: "feild missing",
        msg: FieldErrors,
      });
    } else {
      const user1 = await User.findOne({
        $or: [{ email: email }],
        is_deleted: false,
      });

      if (!user1) {
        return res.status(404).json({ message: "user not found" });
      } else {
        const stored = user1.password;
        const checkingHashed = /^\$2[aby]\$\d{2}\$/.test(stored);
        let isMatch = false;

        if (checkingHashed) {
          isMatch = await bcrypt.compare(password, user1.password);
        } else {
          isMatch = password === stored;
        }

        if (isMatch) {
          const token = jwt.sign(
            { id: user1._id, role: user1.role, name: user1.name,profile_pic: user1.profile_pic || null },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
          );

          const userData = {
            id: user1._id,
            name: user1.name,
            email: user1.email,
            role: user1.role,
            profile: user1.profile_pic || null,
          };

          return res.json({
            message: "login successfull",
            AccessToken: token,
            userData: userData,
          });
        } else {
          return res.status(401).json({ message: "Invalid password" });
        }
      }
    }
  } catch (err) {
    res.status(400).json({
      message: "error is in the backend login function",
      err,
    });
  }
};

// ------updte user--------
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ message: "user not found" });
    } else {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const FieldErrors = {};
        errors.array().forEach((err) => {
          const key = err.path;
          FieldErrors[key] = err.msg;
        });

        return res.status(400).json({
          message: "feild missing",
          msg: FieldErrors,
        });
      } else {
        const { name, password, bio } = req.body;

        let updateData = {};

        if (name) {
          const UserExist = await User.findOne({ name });
          if (UserExist) {
            return res.status(401).json({ message: "username already exist" });
          } else {
            updateData.name = name;
          }
        }

        if (password) {
          const passwordPattern = /^.{7,}$/;
          if (!passwordPattern.test(password)) {
            return res
              .status(404)
              .json({ message: "password must contain 8 charecters " });
          } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
          }
        }

        if (bio) {
          updateData.bio = bio;
        }
        if (req.file) {
          updateData.profile_pic = "/uploads/" + req.file.filename;
        }
        console.log(updateData);
        const update = await User.findByIdAndUpdate(userId, updateData, {
          new: true,
        });

        return res
          .status(201)
          .json({ message: "data have been updated", data: update });
      }
    }
  } catch (err) {
    console.log(err, "error is in the backend update-user");
  }
};

// ------------------viewProfile ----------------------

export const viewProfile = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    if (!userId) {
      return res.status(404).json({ message: "user id is not found" });
    } else {
      const user = await User.findOne({ _id: userId, is_deleted: false });
      return res.status(200).json({ message: "profile data is", data: user });
    }
  } catch (err) {
    res.status(500).json({ message: "error is in the backend view profile " });
    console.log(err, "error is in the backend view profile ");
  }
};


// -------------------- Forgot Password --------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if(!email){
      return res.status(400).json({message:"email is requierd"})
    }
    else{
      const user = await User.findOne({ email });
      if (!user){
        return res.status(404).json({ message: "user not found" });
      } 
      else{
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();
    
        await sendOtpMail(email, otp); // send OTP via email
        res.json({ message: "OTP sent to email" });
      }
  
    }
  } catch (err) {
    console.log(err, "error in forgotPassword");
    res.status(500).json({ message: "server error in forgotPassword" });
  }
};

// -------------------- Verify OTP --------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, resetOtp: otp, resetOtpExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
    res.json({ message: "OTP verified" });
  } catch (err) {
    console.log(err, "error in verifyOtp");
    res.status(500).json({ message: "server error in verifyOtp" });
  }
};

// -------------------- Reset Password --------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, resetOtp: otp, resetOtpExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.log(err, "error in resetPassword");
    res.status(500).json({ message: "server error in resetPassword" });
  }
};