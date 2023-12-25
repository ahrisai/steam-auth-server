
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { Request,Response } from "express";
import authRouter from './routes/auth.routes.js';


const app = express();


const allowedOrigins = ['http://localhost:5173'];

app
  .use(
    cors({
      origin: allowedOrigins,
      credentials:true
    })
  )
  .use(express.json())
  .use(cookieParser())
  
  .get('/',(req:Request,res:Response)=>{
      res.send('hello world')
  })
  .use('/api',authRouter)
  

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});