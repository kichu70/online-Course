import mongoose from "mongoose";

// ------------------ Course Schema ------------------
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum:['BCA','B-come','BA','BBA']
    },

    thumbnail: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      default: 0, // free course
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    average_rating: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // Admin approval
    },

    total_enrolled: {
      type: Number,
      default: 0,
    },
    total_lectures:{
      type:Number,
      default:0
    },
    is_deleted:{
      type:Boolean,
      default:false,
      required:true
    }
  },  
  { timestamps: true }
);

export const Course = mongoose.model("courses", courseSchema);
