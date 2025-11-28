import dotenv from "dotenv";
dotenv.config();

import { Course } from "../models/course.js";
import { Enrolled } from "../models/enrolled.js";
import Stripe from "stripe";
import { Lecture } from "../models/lecture.js";
import { Review } from "../models/review.js";
import {Completed} from "../models/completedLecture.js"

// --------list allcourse--------

export const allCourse = async (req, res) => {
  try {
    const query = req.query;
    console.log(query);
    const isDelete = { is_deleted: false };
    const isApproved = { status: "approved" };
    const filter = Object.assign({}, isDelete, query, isApproved);
    console.log(filter);
    const data = await Course.find(filter);
    res.status(201).json({ message: "all course's are", data });
  } catch (err) {
    res.status(500).json({
      message: "error is in the backend list all course in user",
      err: err,
    });
    console.log(err, "error is in the backend list all course in user");
  }
};

// ----------singleCourse---------------

export const singleCourse = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await Course.findOne({
      _id: id,
      is_deleted: false,
      status: "approved",
    });
    if (!data) {
      return res.status(404).json({ message: "no course found !!" });
    } else {
      res
        .status(201)
        .json({ message: "single course have been fetched", data: data });
    }
  } catch (err) {
    res.status(500).json({ message: "error is in the backend single course" });
    console.log(err, "error is in the backend single course");
  }
};

// ---------addEnrolle------------

export const addEnroll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;
    const course = await Course.findOne({
      _id: courseId,
      is_deleted: false,
      status: "approved",
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    } else {
      const alreadyhave = await Enrolled.findOne({
        student: userId,
        course: courseId,
      });
      if (alreadyhave) {
        return res.status(400).json({ message: "Already enrolled" });
      } else {
        if (course.price <= 0) {
          const enrolled = await Enrolled.create({
            course: courseId,
            student: userId,
          });
          course.total_enrolled = course.total_enrolled + 1;
          await course.save();
          return res
            .status(201)
            .json({ message: "course is free user enrolled", data: enrolled });
        } else {
          return res.status(200).json({
            message: "Paid course !!",
          });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ message: "error is in the enroll student" });
    console.log(err, "error is in the enroll student");
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const paidEnroll = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ message: "No session ID provided" });
    }

    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const courseId = session.metadata.courseId;
    const userId = session.metadata.userId;

    // Check if course exists
    const course = await Course.findOne({
      _id: courseId,
      is_deleted: false,
      status: "approved",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user already enrolled
    const alreadyEnrolled = await Enrolled.findOne({
      student: userId,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // Enroll user
    const enrolled = await Enrolled.create({
      course: courseId,
      student: userId,
    });

    return res
      .status(201)
      .json({ message: "Payment successful, user enrolled!", data: enrolled });
  } catch (err) {
    console.log(err, "Error in paid enrollment");
    return res.status(500).json({ message: "Error enrolling student" });
  }
};

// ---------get the enrolled course's -----------

export const enrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Enrolled.find({ student: userId });
    if (!data) {
      return res.status(404).json({ message: "not enrolled" });
    } else {
      return res.status(200).json({ message: "enrolled course's are", data: data });
    }
  } catch (err) {
    console.log(err, "error is in the get enrolled courses in the backend ");
    res.status(500).json({
      message: "error is in the get enrolled courses in the backend ",
    });
  }
};

// ---------viewlectue -enrolled course ---------------

export const viewLectuerVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({ message: "no courseId found" });
    } else {
      const data = await Enrolled.findOne({
        course: courseId,
        student: userId,
      });
      if (!data) {
        return res.status(404).json({ message: "not enrolled" });
      } else if (data) {
        const enrollId = data._id;
        if (!enrollId) {
          return res.status(404).json({ message: "no enroll id found" });
        } else {
          const lecture = await Lecture.find({
            course: courseId,
            is_deleted: false,
          });
          return res.status(200).json({ message: "lectures are ", lecture });
        }
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the viewLectuer videos backend" });
    console.log(err, "error is in the viewLectuer videos backend");
  }
};

// -----------single lecture----------------------------------


export const singleLecture =async (req,res)=>{
  try{
    const {id:userId,role}=req.user;
    const {courseId}=req.query;
    if(!courseId){
      return res.status(404).json({message:"no courseId found !!"})
    }
    else{
      const enroll = await Enrolled.findOne({
        course: courseId,
        student: userId,
      });
      if(!enroll){
        return res.status(404).json({message:"not enrolled"})
      }
      else{
        const {lectureId}=req.query;
        if(!lectureId){
          return res.status(404).json({message:"no lecture id found !!"})
        }
        else{
          const data =await Lecture.findOne({_id:lectureId,course:courseId,is_deleted:false})
          return res.status(200).json({message:"the lecture is ",data:data})
        }
      }
    }
  }
  catch(err){
    res.status(500).json({message:"error is in the backend view single lecture"})
    console.log(err,"error is in the backend view single lecture")
  }
}


// --------------add review ---------------------------------

export const addReview = async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user.id;
    const { rating } = req.body;
    // const cmnt =req.body
    if (!courseId) {
      return res.status(404).json({ message: "course id is not found" });
    } else {
      const course = await Course.findOne({ is_deleted: false, _id: courseId });
      if (!course) {
        return res.status(404).json({ message: "course not found" });
      } else {
        if (!rating || rating < 1 || rating > 5) {
          return res
            .status(400)
            .json({ message: "rating must be between 1 and 5" });
        } else {
          const review = await Review.findOne({
            course: courseId,
            student: userId,
          });
          if (review) {
            return res
              .status(400)
              .json({ message: "you have already added the rating" });
          } else {
            const createReview = await Review.create({
              course: courseId,
              student: userId,
              rating: rating,
              // comment:cmnt
            });

            const allRating = await Review.find({ course: courseId });
            const total = allRating.reduce((sum, r) => sum + r.rating, 0);
            const avg = total / allRating.length;

            course.average_rating = Number(avg);
            await course.save();

            return res.status(201).json({ message: "review is added",data:createReview ,newAverage: avg,});
          }
        }
      }
    }
  } catch (err) {
    console.log(err, "error is in the backend add review");
    res.status(500).json({ message: "error is in the backend add review" });
  }
};



// -----------------completed lectures ---------------

export const completedLecture=async(req,res)=>{
  try{
    const {id:userId,role}=req.user
    if(role !== "student"){
      return res.status(405).json({message:"not authorized"})
    }
    else{
      const {courseId,lectureId}=req.query
      if(!courseId ||!lectureId){
        return res.status(404).json({message:"both course id and lecture id's are requierd"})
      } 
      else{
        const completed =await Completed.findOne({course:courseId,lecture:lectureId})
        if(completed){
          return res.status(208).json({message:"already exist"})
        }
        else{
          const newCompleted =await Completed.create({
            course:courseId,lecture:lectureId,user:userId
          })
          return res.status(201).json({message:"lescture havebeen completed ",data:newCompleted})
        }
      }
    }
  }
  catch(err){
    res.status(500).json({message:"error is in the backend complete lecture "})
    console.log(err,"error is in the backend complete lecture ")
  }
}