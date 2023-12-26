import { secretKey } from "../config.js";
import jwt from 'jsonwebtoken'
import { Request,Response,NextFunction } from "express";


interface AuthRequest <T> extends Request{
    user?:T
}

export default function(req:AuthRequest<any>,res:Response,next:NextFunction){
    
if(req.method==='OPTIONS'||req.path==='/api/login'||req.path==='/api/registration'){
   return next()
}

try {
    
   const token = req.cookies.token
   if(!token){
    return res.status(403).json({message:'user not authorized'})
   }
   const decoded=jwt.verify(token,secretKey)
   req.user=decoded
   if(req.path==='api/check'){
    return res.status(202).json({message:'true'})
   }
   next()
} catch (e) {
    return res.status(403).json({message:'user not authorized'})
}
}