import mongoose from "mongoose";

// ---------------lecture completes schema-----------

const completedLectures = new mongoose.Schema(
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
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lectures",
      required: true,
    },
  },
  { timestamps: true }
);

export const Completed = mongoose.model("completed", completedLectures);
