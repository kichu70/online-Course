import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export const authCheck =(req,res,next )=>{
    const authHeader = req.headers.authorization;
    const token =authHeader && authHeader.split(" ")[1];

    if(!token){
        return res.status(400).json({message:"user is  not authenticated from verifytoken "})
    } else {
        try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET)

            console.log("JWT_SECRET:", process.env.JWT_SECRET);
            req.user=decoded
            // console.log(decoded)
            next();
        }
            catch(err){
            res.status(401).json({message:"acces denied"})
            console.error(err,"error is found on creating token")
        }
    }
}