import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose"

const connect = mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("moongose connected"))
.catch((err)=>console.log(err,"there is an error in the connecting mongoose"))

export default connect;