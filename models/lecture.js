import mongoose from "mongoose";

// ------------------ Lecture Schema ------------------
const lectureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    // enrolled:{
    //   type:mongoose.Schema.Types.ObjectId,
    //   ref:"enrolleds",
    //   required:true,
    // },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    video_url: {
      type: String,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("lectures", lectureSchema);
