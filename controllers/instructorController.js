import { validationResult } from "express-validator";
import { Course } from "../models/course.js";
import { Lecture } from "../models/lecture.js";
import { Enrolled } from "../models/enrolled.js";

// -----------------single course---------------------

export const singleCourse = async (req, res) => {
  try {
    const { id: instructorId, role } = req.user;
    if (role !== "instructor") {
      return res.status(405).json({ message: "not authorized" });
    } else {
      const { courseId } = req.query;
      const courses = await Course.findOne({
        instructor: instructorId,
        _id: courseId,
      });
      return res.status(200).json({ message: "all courses are", courses });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend all course in instructor" });
    console.log(err, "error is in the backend all course in instructor");
  }
};

// ------------view all course---------------

export const instructorCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "id is requierd" });
    } else {
      const course = await Course.find({
        instructor: userId,
        is_deleted: false,
      });
      res.status(201).json({ message: "all couses are fetched", data: course });
    }
  } catch (err) {
    console.log(err, "error is in the bakend view-all-course");
    res.status(500).json({ message: "error is in the bakend view-all-course" });
  }
};

//------------creating course--------------

export const createCoures = async (req, res) => {
  try {
    const { id: userId, role: userRole } = req.user;

    if (userRole !== "instructor") {
      return res.status(401).json({
        message: "User not authorized",
      });
    } else {
      const { title, description, category, price } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const FeildErrors = {};
        errors.array().forEach((err) => {
          const key = err.path;
          FeildErrors[key] = err.msg;
        });
        return res.status(400).json({
          message: "feild missilg",
          msg: FeildErrors,
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Thumbnail is required" });
      }

      const thumbnailPath = "/uploads/" + req.file.filename;

      const newCourse = await Course.create({
        title,
        description,
        category,
        price,
        instructor: userId,
        thumbnail: thumbnailPath,
      });

      res.status(201).json({
        message: "Course created successfully",
        data: newCourse,
      });
    }
  } catch (err) {
    console.log(err, "error is in the create course in backend");
    res
      .status(500)
      .json({ message: "error is in the create course in backend", err });
  }
};

// -------update course---------------

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.query;
    const userId = req.user.id;
    if (!id) {
      return res.status(400).json({ message: "id is requierd" });
    }
    const data = await Course.findOne({
      instructor: userId,
      _id: id,
      is_deleted: false,
      status: "approved",
    });

    if (!data) {
      console.log("Access denied");
      return res.json({ message: "cant't update the Course" });
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const FeildErrors = {};
        errors.array().forEach((err) => {
          const key = err.path;
          FeildErrors[key] = err.msg;
        });
        return res.status(400).json({
          message: "feild missilg",
          msg: FeildErrors,
        });
      } else {
        const { title, description, category, price } = req.body;
        const updateCourse = await Course.findByIdAndUpdate(
          id,
          { title, description, category, price },
          {
            new: true,
          }
        );
        if (!updateCourse) {
          return res.status(404).json({ message: "course not found" });
        } else {
          res
            .status(404)
            .json({ message: "Couser have been updated", data: updateCourse });
        }
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend update course", err: err });
    console.log(err, "error is in the backend update course");
  }
};

// -----------delete course--------

export const deleteCourse = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    if (role !== "instructor") {
      return res.status(405).json({ message: "access denied" });
    } else {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(400).json({ message: "couresid is requierd" });
      } else {
        const course = await Course.findOne({
          instructor: userId,
          _id: courseId,
          is_deleted: false,
        });

        if (!course) {
          return res.status(400).json({ message: "course not found!!" });
        } else {
          const dltData = await Course.findByIdAndUpdate(
            courseId,
            { is_deleted: true },
            { new: true }
          );
          if (!dltData) {
            return res.status(404).json({ message: "page not found" });
          } else {
            return res
              .status(201)
              .json({ message: "Couser have been deleted", data: dltData });
          }
        }
      }
    }
  } catch (err) {
    console.log(err, "error is in the backend delete course");
    res.status(500).json({ message: "error is in the backend delete course" });
  }
};

// =========================Lecture functions=========================================================================

// ------------------view all lectures -------------------

export const allLecture = async (req, res) => {
  try {
    const { id: instructorId, role } = req.user;
    if (role !== "instructor") {
      return res.status(405).json({ message: "not authorized" });
    } else {
      const { courseId } = req.query;
      if (!courseId) {
        return res.status(404).json({ message: "no course id is found" });
      } else {
        const lecture = await Lecture.find({
          course: courseId,
          is_deleted: false,
          instructor: instructorId,
        });
        if (!lecture) {
          return res.status(404).json({ message: "no lectures found" });
        } else {
          return res.status(200).json({ message: "lectures are", lecture });
        }
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend instroctur all lecture" });
    console.log(err, "error is in the backend instroctur all lecture");
  }
};

// ----------------single lecture----------------------

export const singleLecture = async (req, res) => {
  try {
    const { id: instructorId, role } = req.user;
    if (role !== "instructor") {
      return res.status(405).json({ message: "not authorized" });
    } else {
      const { courseId, lectureId } = req.query;
      if (!courseId || !lectureId) {
        return res.status(404).json({ message: "no course id is found" });
      } else {
        const lecture = await Lecture.find({
          course: courseId,
          _id: lectureId,
          is_deleted: false,
          instructor: instructorId,
        });
        if (!lecture) {
          return res.status(404).json({ message: "no lectures found" });
        } else {
          return res.status(200).json({ message: "lecture data is", lecture });
        }
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend instroctur single lecture" });
    console.log(err, "error is in the backend instroctur single lecture");
  }
};

// -----------------------add lecture ----------------------

export const addLecture = async (req, res) => {
  try {
    const { id: instructorId, role: userRole } = req.user;

    if (userRole !== "instructor") {
      return res.status(401).json({
        message: "User not authorized",
      });
    } else {
      const errors = validationResult(req);
      const { title } = req.body;
      if (!errors.isEmpty()) {
        const FeildErrors = {};
        errors.array().forEach((err) => {
          const key = err.path;
          FeildErrors[key] = err.msg;
        });
        return res.status(400).json({
          message: "feild missilg",
          msg: FeildErrors,
        });
      } else {
        const { courseId } = req.query;
        if (!req.file) {
          return res.status(400).json({ message: "Video file is required" });
        } else {
          const course = await Course.findOne({
            _id: courseId,
            instructor: instructorId,
            is_deleted: false,
          });
          if (!course) {
            return res.status(404).json({ message: "Course not found" });
          } else {
            const videoUrl = "/uploads/" + req.file.filename;
            const newLecture = await Lecture.create({
              course: courseId,
              instructor: instructorId,
              title,
              video_url: videoUrl,
            });
            course.total_lectures = course.total_lectures + 1;
            await course.save();
            res.status(201).json({
              message: "Lecture added successfully",
              lecture: newLecture,
            });
          }
        }
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend the add lecture", err: err });
    console.log(err, "error is in the backend the add lecture");
  }
};

//--------------------update lecture--------------

export const updateLecture = async (req, res) => {
  try {
    const { id: instructorId, role } = req.user;
    if (role !== "instructor") {
      return res.status(405).json({ message: "not authorized" });
    } else {
      const { courseId, lectureId } = req.query;
      const { title } = req.body;
      if (!courseId || !lectureId) {
        return res.status(400).json({ message: "id is requierd" });
      } else {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          const FeildErrors = {};
          errors.array().forEach((err) => {
            const key = err.path;
            FeildErrors[key] = err.msg;
          });
          return res.status(400).json({
            message: "feild missilg",
            msg: FeildErrors,
          });
        } else {
          const course = await Course.findOne({
            _id: courseId,
            instructor: instructorId,
            is_deleted: false,
            status: "approved",
          });

          if (!course) {
            return res.status(404).json({ message: "no course found!!" });
          } else {
            const lecture = await Lecture.findOne({
              _id: lectureId,
              course: courseId,
              instructor: instructorId,
              is_deleted: false,
            });

            if (!lecture) {
              return res.status(404).json({ message: "Lecture not found" });
            } else {
              const updatedLecture = await Lecture.findByIdAndUpdate(
                lectureId,
                { title: title },
                { new: true }
              );
              if (!updatedLecture) {
                return res
                  .status(404)
                  .json({ message: "can't update lecture" });
              } else {
                return res
                  .status(200)
                  .json({ message: "data updated", data: updatedLecture });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(err, "error is in the backend update lecture");
  }
};

//----------delete lecture----------------

export const deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.query;
    const instructorId = req.user.id;

    if (!courseId || !lectureId) {
      return res.status(400).json({ message: "id is requierd" });
    } else {
      const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId,
        is_deleted: false,
        status: "approved",
      });

      if (!course) {
        return res.status(404).json({ message: "no course found!!" });
      } else {
        const lecture = await Lecture.findOne({
          _id: lectureId,
          course: courseId,
          is_deleted: false,
        });

        if (!lecture) {
          return res.status(404).json({ message: "Lecture not found" });
        } else {
          const updatedLecture = await Lecture.findByIdAndUpdate(
            lectureId,
            { is_deleted: true },
            { new: true }
          );
          if (!updatedLecture) {
            return res.status(404).json({ message: "can't delete lecture" });
          } else {
            return res
              .status(200)
              .json({ message: "data deleted", data: updatedLecture });
          }
        }
      }
    }
  } catch (err) {
    console.log(err, "error is in the backend delete lecture");
  }
};

// -----------enrolledCousersDetail------------------

export const enrolledDetails = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { courseId } = req.query;
    if (!userRole) {
      return res.status(400).json({ message: "no user role found" });
    } else {
      if (userRole === "instructor") {
        if (!courseId) {
          return res.status(400).json({ message: "no course id found" });
        } else {
          const enrolled = await Enrolled.find({ course: courseId });
          return res
            .status(200)
            .json({ message: "enrolled students are", data: enrolled });
        }
      } else {
        return res.status(400).json({ message: "access denied" });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "error is in the enrolled details in the backend ",
      err: err,
    });
    console.log(err, "error is in the enrolled details in the backend ");
  }
};

// -----------findAvgRating ----------------------

export const avgRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({ message: "no course id found" });
    } else {
      const course = await Course.findOne({ is_deleted: false, _id: courseId });
      const avg = course.average_rating;
      return res
        .status(200)
        .json({ message: "avarage rating of the course is", data: avg });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "error is in the backend avgrating", err: err });
    console.log(err, "error is in the backend avgrating");
  }
};
