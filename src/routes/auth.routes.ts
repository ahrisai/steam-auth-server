import { Router } from 'express'
import { check } from "express-validator";

import AuthController from '../controllers/AuthController.js'

const authRouter = Router()

authRouter.post('/registration',AuthController.registration)
authRouter.post('/login',AuthController.login)




export default authRouter