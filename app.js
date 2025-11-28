import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import http from "http"
import cors from 'cors'
import connect from './config/connectDB.js'
import userRouter from './routes/studentRoute.js'
import instructorRoute from './routes/instructorRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import authRouter from './routes/authRoutes.js'

connect;

const app = express()
const server = http.createServer(app)

app.use(express.json())
app.use(cors())

app.use("/auth",authRouter)
app.use("/student",userRouter)
app.use("/instructor",instructorRoute)
app.use("/payment",paymentRouter)
app.use("/admin",adminRouter)


const PORT = process.env.PORT

server.listen(PORT,()=>{
    console.log("server running")
    console.log(`http://localhost:${PORT}`)
})
