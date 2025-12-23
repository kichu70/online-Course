import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "admin", "instructor"], //----
      default: "student",
    },
    profile_pic: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpiry: {
      type: Date,
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("users", UserSchema);

export default User;
