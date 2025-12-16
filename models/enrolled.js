import mongoose from "mongoose";


// ---------------enroller schema-----------


const enrolledSchema = new mongoose.Schema({
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
         price_at_purchase: { type: Number, required: true },
}, { timestamps: true })


export const Enrolled = mongoose.model("enrolleds", enrolledSchema);
