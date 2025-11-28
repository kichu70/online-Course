import mongoose from "mongoose";

// ------------------ Review Schema ------------------
const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("reviews", reviewSchema);
