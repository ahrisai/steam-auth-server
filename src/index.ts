
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { Request,Response } from "express";

import passport from './steam.js'
import session from 'express-session';


import { PrismaClient } from '@prisma/client';
import { CsGoData, JwtUser } from './queryTypes.js';
import AuthMiddleware from './middlewares/AuthMiddleware.js';
const app = express();

let csgoData={} ;
const allowedOrigins = ['http://localhost:5173','https://squadlink.vercel.app'];
const prisma = new PrismaClient()

app
  .use(
    cors({
      origin: allowedOrigins,
      credentials:true,
    })
  )

  .use(cookieParser())
  .use(AuthMiddleware)
  .get('/',(req:Request,res:Response)=>{
      res.send('hello world')
  })
  
  app.use(session({
    secret: 'bimg',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));
  passport.serializeUser((data, done) => {
    if(data!=='noData') csgoData={...data}
    
    done(null, data); 
  });
  app.get('/api/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  
  async (req, res) => {

    if(req.body){
      

    if(Object.keys(csgoData).length===0) return res.cookie('_csData','noFaceit').redirect(303, `http://localhost:5173/home`);
    
      const jwtUser:JwtUser=req.body as JwtUser

      const newCsGoData={
        ...csgoData,
        userId:jwtUser.id
      } as CsGoData

      const checkCSdata=await prisma.csgo_data.findFirst({where:{steamId:newCsGoData.steamId}})
      if(checkCSdata){
        return res.cookie('_csData','exist').redirect(303, `http://localhost:5173/home`)
      }
      if(newCsGoData.elo===undefined) res.cookie('_csData','noFaceit').redirect(303, `http://localhost:5173/home`);

      if(newCsGoData.elo){
        console.log(newCsGoData)
        const response = await prisma.csgo_data.create({data:{...newCsGoData}})
       return  res.cookie('_csData',JSON.stringify(newCsGoData)).redirect(303, `http://localhost:5173/home`);
      }
      


    }
    
   
  });

app.get('/api/auth/steam/return',
  
  async (req, res) => {
  
  res.redirect(303, 'http://localhost:5173/home');
  });
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});