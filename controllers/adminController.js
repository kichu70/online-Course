import { Course } from "../models/course.js";
import User from "../models/user.js";
import { Lecture } from "../models/lecture.js";

// --------viewAll User -----------------

export const allUsers = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "User not authorized" });
    } else {
      const query = req.query;
      const users = await User.find(query);
      res.status(200).json({ message: "all users are", data: users });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend admin all users" });
    console.log(err, "error is in the backend admin all users");
  }
};

// --------------------------viewSingle User---------------------------

export const singleUser = async (req, res) => {
  try {
    const { id: adminId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "not authorized" });
    } else {
      const { userId } = req.query;
      if (!userId) {
        return res.status(404).json({ message: "no user id found" });
      } else {
        const data = await User.findOne({ _id: userId });
        return res
          .status(200)
          .json({ message: "single user data is", data: data });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "error is in the backend single user" });
    console.log(err, "error is in the backend single user");
  }
};

// ----------delete user ----------------

export const deleteUser = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "User not authorized" });
    } else {
      const { id } = req.query;
      let msg = "";
      if (!id) {
        return res.status(401).json({ message: "user id not found" });
      } else {
        const user = await User.findById(id);

        const deleted = await User.findByIdAndUpdate(
          id,
          { is_deleted: !user.is_deleted },
          { new: true }
        );
        if (!deleted) {
          return res.status(401).json({ message: "data cant delete" });
        }
        if (user.is_deleted === true) {
          msg = "user have been reactivated";
        } else {
          msg = "user have been deleted";
        }
        res.status(201).json({ message: msg, data: deleted });
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the admin backend delete user" });
    console.log(err, "error is in the admin backend delete user");
  }
};

// ======================course ======================================================

//-------approve course ------------

// export const approveCourse =async (req,res)=>{
//     try{
//         const {id:userId,role}=req.user;
//         if(role !=="admin"){
//             return res.status(405).json({message:"user not authorized"})
//         }
//         else{
//             const {courseId} =req.query;
//             if(!courseId){
//                 return res.status(404).json({message:"no course id found"})
//             }
//             else{
//                 const course =await Course.findOne({is_deleted:false,_id:courseId})
//                 if(!course){
//                     return res.status(404).json({message:"no course found"})
//                 }
//                 else{
//                     if(course.status ==="Approved"){
//                         return res.status(400).json({message:"course already approved"})
//                     }
//                     else{
//                         const approved =await Course.findByIdAndUpdate(courseId,{status:"Approved"},{new:true})
//                         return res.status(200).json({message:"course have been varifyed",data:approved})
//                     }
//                 }
//             }
//         }
//     }
//     catch(err){
//         res.status(500).json({message:"error is in the backend approve course"})
//         console.log(err,"error is in the backend approve course")
//     }
// }

// //-------reject course ------------

// export const rejectCourse =async (req,res)=>{
//     try{
//         const {id:userId,role}=req.user;
//         if(role !=="admin"){
//             return res.status(405).json({message:"user not authorized"})
//         }
//         else{
//             const {courseId} =req.query;
//             if(!courseId){
//                 return res.status(404).json({message:"no course id found"})
//             }
//             else{
//                 const course =await Course.findOne({is_deleted:false,_id:courseId})
//                 if(!course){
//                     return res.status(404).json({message:"no course found"})
//                 }
//                 else{
//                     if(course.status ==="rejected"){
//                         return res.status(400).json({message:"course already Rejected"})
//                     }
//                     else{
//                         const approved =await Course.findByIdAndUpdate(courseId,{status:"rejected"},{new:true})
//                         return res.status(200).json({message:"course have been rejected",data:approved})
//                     }
//                 }
//             }
//         }
//     }
//     catch(err){
//         res.status(500).json({message:"error is in the backend approve course"})
//         console.log(err,"error is in the backend approve course")
//     }
// }

// -----------list all courses --------------

export const allCourse = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(404).json({ message: "not authorized" });
    } else {
      const query = req.query;
      const course = await Course.find(query);
      return res
        .status(200)
        .json({ message: "all course's are", data: course });
    }
  } catch (err) {
    res.status(500).json({ message: "error is in the backend all course's" });
    console.log(err, "error is in the backend all course's");
  }
};




// ----------single course ---------------------------




export const singelCourse =async(req,res)=>{
  try{
    const{id:adminId,role}=req.user
    if(role !=="admin"){
      return res.status(405).json({message:"no't authorized"})
    }
    else{
      const {courseId}=req.query;
      if(!courseId){
        return res.status(404).json({message:"no course id found "})
      }
      else{
        const course=await Course.findById(courseId)
        if(!course){
          return res.status(404).json({message:"no course found"})
        }
        else{
          return res.status(200).json({message:"course details is ",course})
        }
      }
    }
  }
  catch(err){
    res.status(500).json({message:"error is in the backend viewsingle Coures admin"})
    console.log(err,"error is in the backend viewsingle Coures admin")
  }
}



// --------------approve reject toggle --------------

export const toggleCourseStatus = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(404).json({ message: "not authorized" });
    } else {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(404).json({ message: "no course id found " });
      } else {
        let newstatus = null;
        const course = await Course.findOne({
          _id: courseId,
          is_deleted: false,
        });

        if (!course) {
          return res.status(404).json({ message: "no course found" });
        } else {
          if (course.status === "approved") {
            newstatus = "rejected";
          } else if (course.status === "rejected") {
            newstatus = "approved";
          } else if (course.status === "pending") {
            newstatus = "approved";
          }

          const update = await Course.findByIdAndUpdate(
            courseId,
            { status: newstatus },
            { new: true }
          );
          return res
            .status(200)
            .json({ message: "status have been updated", data: update });
        }
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend togglecourse status " });
    console.log(err, "error is in the backend togglecourse status ");
  }
};

// -----------delete course --------------------------

export const deleteCourse = async (req, res) => {
  try {
    const { id: adminId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "no  authorized" });
    } else {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(404).json({ message: "no course id found" });
      } else {
        let msg = "";

        const course = await Course.findById(courseId);
        const deleted = await Course.findByIdAndUpdate(
          courseId,
          { is_deleted: !course.is_deleted },
          { new: true }
        );
        if (!deleted) {
          return res.status(401).json({ message: "data cant delete" });
        } else {
          if (course.is_deleted === true) {
            msg = "course have been reactivated";
          } else {
            msg = "Course have been deleted";
          }
          return res.status(200).json({ message: msg, data: deleted });
        }
      }
    }
  } catch (err) {
    res.status(500).json({ message: "error is the backend the delete course" });
    console.log(err, "error is the backend the delete course");
  }
};

// ==============================lecture============================

// -----------------viewlectures---------------------------

export const allLectures = async (req, res) => {
  try {
    const { id: adminId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "no  authorized" });
    } else {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(404).json({ message: "no coures id found" });
      } else {
        const lecture = await Lecture.find({ course:courseId });
        if (!lecture) {
          return res.status(404).json({ message: "no lecture found" });
        } else {
          return res
            .status(200)
            .json({ message: "the lecture's of the course are ", lecture });
        }
      }
    }
  } catch (err) {
    console.log(err, "error is in the backend view all lectures");
  }
};

// -------------single lecture ----------------------------

export const singleLecture = async (req, res) => {
  try {
    const { id: adminId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "no authorized" });
    } else {
      const { lectureId } = req.query;
      if (!lectureId) {
        return res.status(404).json({ message: "no lecture id found" });
      }
      const lecture =await Lecture.findById(lectureId)
      return res.status(200).json({message:"the single lecture is",lecture})
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend view single lectures" });
    console.log(err, "error is in the backend view single lectures");
  }
};

// ------------delete Lecture ----------------------------

export const toggledeleteLecture = async (req, res) => {
  try {
    const { id: adminId, role } = req.user;
    if (role !== "admin") {
      return res.status(405).json({ message: "not authorized" });
    } else {
      const { lectureId } = req.query;
      let msg = "";
      if (!lectureId) {
        return res.status(404).json({ message: "no lecture id found" });
      } else {
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
          return res.status(404).json({ message: "no lecture found" });
        }
        const deleted = await Lecture.findByIdAndUpdate(
          lectureId,
          { is_deleted: !lecture.is_deleted},
          { new: true }
        );
        if (!deleted) {
          return res.status(401).json({ message: "data can't delete" });
        }
        if (lecture.is_deleted === true) {
          msg = "lecture have been reactive";
        } else {
          msg = "lecture have been deleted";
        }
        res.status(200).json({ message: msg, data: deleted });
      }
    }
  } catch (err) {
    res.status(500).json({ message: "error is in the backend delete lecture" });
    console.log(err, "error is in the backend delete lecture");
  }
};
