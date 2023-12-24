import { Router } from 'express'
import { check } from "express-validator";

import AuthController from '../controllers/AuthController.js'

const authRouter = Router()

authRouter.post('/registration',
[check('name','Name cannot be empty').notEmpty(),
 check('password','pass can be longer then 4 but shorter then 10').isLength({min:4,max:10})
],AuthController.registration)
authRouter.post('/login',AuthController.login)




export default authRouter