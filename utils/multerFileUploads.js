import multer, { diskStorage } from "multer";
import { type } from "os";
import path from "path"

// STORAGE ENGINE


const storage =multer.diskStorage({
    destination:(req,file,cb)=>{cb(null,"uploads/")},

    
    filename:(req,file,cb)=>{
        const ext =path.extname(file.originalname);
        const uniqueName=Date.now()+Math.round(Math.random() * 1e2)+ext
        cb(null,uniqueName)
    },
})


// FILE FILTER (VALIDATION)


const fileFilter=(req,file,cb)=>{
    const allowedType=["image/","video/"];
    const isValid = allowedType.some((type)=>file.mimetype.startsWith(type))
    if(isValid)cb(null,true)
    else cb(new Error("only image allowed"),false)

}
// MULTER UPLOADER

export const upload=multer({
    storage,
    limits:{fileSize:50*1024*1024},
    fileFilter
})