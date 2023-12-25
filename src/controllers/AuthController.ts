import { User } from './../queryTypes.js';
import { PrismaClient } from "@prisma/client";
import { Request,Response } from "express";
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
  const saltRounds = 7;

  class AuthController{
    registration= async (req:Request,res:Response) => {
        try {
            
           
            const {nickname,password}=req.body 
            const candidate = await prisma.user.findFirst({where:{nickname:nickname}})
            if(candidate){
                return res.status(400).json({message:`user ${nickname} already exist`})
            }
            const hash = bcrypt.hashSync(password, saltRounds);
            console.log(hash)
            const user={
                ...req.body
            }
           
            
            const newUser= await prisma.user.create({data:{...user, password:hash}})
            res.json(newUser)
        } catch (error) {
         console.log(error)
            res.status(400).json({message:'reg error, try again'})
        }
    }
    login= async (req:Request,res:Response) => {
        const {name,password}=req.body 
        
        const candidate = await prisma.user.findFirst({where:{nickname:name}})
        if(!candidate){
            return res.status(404).json('User not found')
        }
            
        const validPassword=bcrypt.compareSync(password,candidate.password)
        if(!validPassword){
            return res.status(404).json('uncorrect password')
        }
        const token = generateAccessToken(candidate.id,candidate.nickname)
        return res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'none'}).send()
    }
  }

  export default new AuthController()