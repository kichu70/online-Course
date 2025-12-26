import nodemailer from "nodemailer";

export const sendCourseRejectedMail = async(
  instructorEmail,
  instructorName,
  courseTitle,
  reason = "Your course does not meet our guidelines"
)=>{
     const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"Admin Team" <${process.env.EMAIL_USER}>`,
    to: instructorEmail,
    subject: "Course Rejected",
    html: `
      <h2>Course Rejection Notice</h2>
      <p>Hello <b>${instructorName}</b>,</p>
      <p>Your course <b>"${courseTitle}"</b> has been <b>rejected</b>.</p>
      <p><b>Reason:</b> ${reason}</p>
      <p>You may update the course and resubmit for review.</p>
      <br/>
      <p>Regards,<br/>Admin Team</p>
    `,
  });
}
