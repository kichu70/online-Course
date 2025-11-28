import express from "express";
import { createCheckoutSession} from "../controllers/paymentController.js";
import { authCheck } from "../middlewares/authCheck.js";

const router = express.Router();
router.use(authCheck);

router.post("/create-checkout-session",createCheckoutSession);
export default router;