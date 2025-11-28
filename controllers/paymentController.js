import dotenv from "dotenv";
dotenv.config();
import { Course } from "../models/course.js";
import Stripe from "stripe";
import { Enrolled } from "../models/enrolled.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user.id;

    const course = await Course.findOne({
      _id: courseId,
      is_deleted: false,
      status: "approved",
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: Math.round(course.price * 100),
            product_data: { name: course.title },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        courseId,
      },
      success_url: `http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log(err, "error is in the payment checkout backend");
    res.status(500).json({ message: err.message });
  }
};