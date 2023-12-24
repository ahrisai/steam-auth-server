import { User } from './../queryTypes.js';
import { PrismaClient } from "@prisma/client";
import { Request,Response } from "express";
import { validationResult } from 'express-validator/src/validation-result.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { secretKey } from '../config.js';

const generateAccessToken= (id:number,name:string) => {
    const payload = {
      id,
      name
    }
    return jwt.sign(payload,secretKey,{expiresIn:'24h'})
  }

  const prisma = new PrismaClient();
  const saltRounds = 5;

  class AuthController{
    registration= async (req:Request,res:Response) => {
        try {
            const errors=validationResult(req)
            if(!errors.isEmpty()) {
                return res.status(404).json({message:errors})
            }
            const {name,password}=req.body 
            const candidate = await prisma.user.findFirst({where:{name:name}})
            if(candidate){
                return res.status(400).json({message:'user already exist'})
            }
            const hash = bcrypt.hashSync(password, saltRounds);
            const user={
                name:name,
                password:hash
            }
            const newUser= await prisma.user.create({data:user})
            res.json(newUser)
        } catch (error) {
         
            res.status(400).json({message:'reg error'})
        }
    }
    login= async (req:Request,res:Response) => {
        const {name,password}=req.body 
        
        const candidate = await prisma.user.findFirst({where:{name:name}})
        if(!candidate){
            return res.status(404).json('User not found')
        }
            
        const validPassword=bcrypt.compareSync(password,candidate.password)
        if(!validPassword){
            return res.status(404).json('uncorrect password')
        }
        const token = generateAccessToken(candidate.id,candidate.name)
        return res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'none'}).send()
    }
  }

  export default new AuthController()