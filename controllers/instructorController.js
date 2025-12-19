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
      }).populate({
        path: "instructor",
        select: "name",
      });
      return res.status(200).json({ message: "course is", data: courses });
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
      }).populate({
        path: "instructor",
        select: "name",
      });

      res.status(201).json({
        message: "all couses are fetched",

        data: course,
      });
    }
  } catch (err) {
    console.log(err, "error is in the bakend view-all-course");
    res.status(500).json({ message: "error is in the bakend view-all-course" });
  }
};

// -----------------find the most rated ---------------

export const mostRatedCourse = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const skip = (page - 1) * limit;

    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "id is requierd" });
    } else {
      const total = await Course.countDocuments({
        instructor: userId,
        is_deleted: false,
      });

      const course = await Course.find({
        instructor: userId,
        is_deleted: false,
      })
        .populate({
          path: "instructor",
          select: "name",
        })
        .skip(skip)
        .limit(limit)
        .sort({ average_rating: -1 });
      res.status(201).json({
        message: "all couses are fetched",
        totalPage: Math.ceil(total / limit),
        totalIteam: total,
        data: course,
      });
    }
  } catch (err) {
    console.log(err, "error is in the bakend view-all-course");
    res.status(500).json({ message: "error is in the bakend view-all-course" });
  }
};
//------------creating course--------------

export const createCoures = async (req, res) => {
  try {
    const { id: userId, role: userRole, name: userName } = req.user;

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
        price: price ? price : 0,
        instructor: userId,
        instructor_name: userName,
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
      // status: "approved",
    });

    if (!data) {
      console.log("Access denied");
      return res.status(400).json({ message: "cant't update the Course" });
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
        ).populate({
          path: "instructor",
          select: "name",
        });
        if (!updateCourse) {
          return res.status(404).json({ message: "course not found" });
        } else {
          res
            .status(201)
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
      const { lectureId } = req.query;
      if (!lectureId) {
        return res.status(404).json({ message: "no lecture id is found" });
      } else {
        const lecture = await Lecture.findOne({
          _id: lectureId,
          is_deleted: false,
          instructor: instructorId,
        });
        if (!lecture) {
          return res.status(404).json({ message: "no lectures found" });
        } else {
          return res
            .status(200)
            .json({ message: "lecture data is", data: lecture });
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
            // Recalculate total lectures
            const totalLectures = await Lecture.countDocuments({
              course: courseId,
              is_deleted: false,
            });
            course.total_lectures = totalLectures;
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
            // Recalculate total lectures
            const totalLectures = await Lecture.countDocuments({
              course: courseId,
              is_deleted: false,
            });
            course.total_lectures = totalLectures;
            await course.save();
            await course.save();
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
    const instructorId = req.user.id;

    if (!userRole) {
      return res.status(400).json({ message: "No user role found" });
    } else {
      if (userRole !== "instructor") {
        return res.status(403).json({ message: "Access denied" });
      } else {
        // Populate student name and course title
        const enrolled = await Enrolled.find()
          .populate({
            path: "student",
            select: "name email",
          })
          .populate({
            path: "course",
            select: "title",
            match: { instructor: instructorId },
          });

        return res.status(200).json({
          message: "Enrolled students with course details",
          data: enrolled,
        });
      }
    }
  } catch (err) {
    console.error("Error in enrolledDetails:", err);
    return res.status(500).json({
      message: "Error fetching enrolled details from backend",
      error: err.message,
    });
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

// -----------total earnings------------------------
export const instructorEarnings = async (req, res) => {
  try {
    const { id: instructorId, role } = req.user;

    if (role !== "instructor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const courses = await Course.find({
      instructor: instructorId,
      is_deleted: false,
    });

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found" });
    }

    let totalEarnings = 0;
    const courseDetails = [];

    for (let course of courses) {
      // Fetch all enrollments with saved purchase price
      const enrollments = await Enrolled.find({ course: course._id });

      // Calculate earnings based on actual purchase price
      const courseEarnings = enrollments.reduce(
        (sum, item) => sum + (item.price_at_purchase || 0),
        0
      );

      totalEarnings += courseEarnings;

      courseDetails.push({
        courseId: course._id,
        title: course.title,
        price: course.price, // current price shown only for info
        enrolledStudents: enrollments.length,
        earnings: courseEarnings,
      });
    }

    return res.status(200).json({
      message: "Instructor earnings fetched successfully",
      totalEarnings,
      courses: courseDetails,
    });
  } catch (err) {
    console.error("Error fetching instructor earnings:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
